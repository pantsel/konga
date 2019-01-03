'use strict';

var _ = require('lodash');

var self = module.exports = {

  /**
   * Before Hooks
   * ToDo: apply more Hooks when needed
   */


  beforeEntityUpdate: function(entityName, entityId, connectionId, data, next) {
    sails.log.debug("KongProxyHooks:beforeEntityUpdate called()");
    if(!entityName || !data.extras || !sails.models["kong" + entityName]
      || !self.hooks[entityName] || !self.hooks[entityName].beforeUpdate) return next(null, data);
    return self.hooks[entityName].beforeUpdate(entityId, connectionId, data, next);
  },

  /**
   * After Hooks
   * ToDo: apply more Hooks if needed
   */

  afterEntityRetrieve: function(entityName, req, data, next) {
    if(data.data && data.data instanceof Array) { // This is a listing request. We must apply correlations recursively.
      return self.afterEntityList(entityName, req, data, next);
    }
    return self.afterEntityFetch(entityName, req, data, next);
  },

  afterEntityFetch: function(entityName, req, data, next) {
    sails.log.debug("KongProxyHooks:afterEntityFetch called()", entityName);
    if(!entityName || !self.hooks[entityName] || !self.hooks[entityName].afterFetch) return next(null, data);
    return self.hooks[entityName].afterFetch( req, data, next);
  },

  afterEntityList: function(entityName, req, resBody, next) {
    sails.log.debug("KongProxyHooks:afterEntityList called()", entityName);
    if(!entityName || !self.hooks[entityName] || !self.hooks[entityName].afterList) return next(null, resBody);
    return self.hooks[entityName].afterList( req, resBody, next);
  },

  afterEntityCreate: function(entityName, req, data, konga_extras, next) {
    sails.log.debug("KongProxyHooks:afterEntityCreate called()", entityName);
    if(!entityName || !self.hooks[entityName] || !self.hooks[entityName].afterCreate) return next(null, data);
    return self.hooks[entityName].afterCreate(req, data, konga_extras, next)
  },

  afterEntityDelete: function(entityName, req, next) {
    sails.log.debug("KongProxyHooks:afterEntityDelete called()", entityName);
    if(!entityName || !self.hooks[entityName] || !self.hooks[entityName].afterDelete) return next();
    return self.hooks[entityName].afterDelete(req, next)

  },

  /**
   * Setup the actual hooks for Kong's entities like `services`,`apis`,`routes` etc.
   */
  hooks: {
    services: {
      beforeUpdate: function(entityId, connectionId, data, next) {

        if(!sails.models.kongservices) return next(null, data);

        sails.models.kongservices.updateOrCreate({
          kong_node_id: connectionId,
          service_id: entityId
        },_.merge(data.extras, {
          kong_node_id: connectionId,
          service_id: entityId
        }), function (err, extras) {
          if(err) {
            sails.log.error(err);
            return next(err);
          }
          // Delete the extras attr
          delete data.extras;
          return next(null, data);
        });
      },
      afterList: function(req, resBody, next) {
        if(!sails.models.kongservices || !req.connection) return next(null, resBody);
        var connectionId = req.connection.id;

        sails.models.kongservices.find({
          kong_node_id: connectionId
        },function (err, extras) {
          if (err) {
            sails.log.error(err);
            return next(null, resBody); // let it pass without the extra appends. No need to block the response
          }

          // Assign the extras to the services
          resBody.data.forEach(function (service) {
            service.extras = _.find(extras, function (extra) {
              return extra.service_id === service.id
            }) || {}
          })
          return next(null, resBody);
        });
      },
      afterFetch: function(req, data, next) {
        if(!sails.models.kongservices || !req.connection) return next(null, data);
        var connectionId = req.connection.id;
        var entityId = req.path.split("/").filter(function (e) {
          return e;
        })[1];

        sails.models.kongservices.findOne({
          kong_node_id: connectionId,
          service_id: entityId
        }, function (err, extras) {
          if(err) {
            sails.log.error(err);
            return next(err);
          }

          if(!extras) return next(null, data);

          // Add the extras attr
          data.extras = extras;
          return next(null, data);
        });
      },
      afterCreate: function(req, data, konga_extras, next) {
        if(!sails.models.kongservices || !req.connection) return next(null, data);
        var connectionId = req.connection.id;
        var entityId = data.id;

        sails.models.kongservices.create(_.merge({
          kong_node_id: connectionId,
          service_id: entityId
        }, konga_extras), function (err, extras) {
          if(err) {
            sails.log.error(err);
            return next(err);
          }

          // Add the extras attr
          data.extras = extras;
          return next(null, data);
        });
      },
      afterDelete: function(req, next) {
        if(!sails.models.kongservices || !req.connection) return next();
        var connectionId = req.connection.id;
        // The path must be of type /kong/<entityName>/<entityId>
        var entityId = req.path.replace("/kong","").split("/").filter(function (e) {
          return e;
        })[1];

        sails.models.kongservices.destroy({
          kong_node_id: connectionId,
          service_id: entityId
        },function (err) {
          if(err) {
            sails.log.error("Failed to remove kong service extras",err);
            return next(err);
          }

          return next();
        })
      },
    },
    apis: {
      afterDelete: function(req, next) {
        if(!req.connection) return next();
        // The path must be of type /kong/<entityName>/<entityId>
        var entityId = req.path.replace("/kong","").split("/").filter(function (e) {
          return e;
        })[1];

        sails.models.apihealthcheck.destroy({
          api_id: entityId
        }).exec(function (err) {
          if(err) {
            sails.log("Failed to delete healthcecks of API " + entityId);
            return next(err);
          }

          return next();
        });
      },
    },
    upstreams: {
      afterList: function(req, resBody, next) {
        if(!req.connection) return next(null, resBody);

        const existingUpstreamIds = _.map(resBody.data, item => item.id);
        sails.log("KongProxyHooks:upstreams:afterList:existingUpstreamIds", existingUpstreamIds);

        if(!existingUpstreamIds.length) {
          return next();
        }

        // Check if there are any alerts that do not match
        // the exiting upstream ids
        sails.models.upstreamalert.find({
          upstream_id : {
            '!' : existingUpstreamIds
          }
        }).exec((err, orphans) => {
          if(err) {
            sails.log.error("KongProxyHooks:upstreams:afterList:Failed to find orphaned upstreams", err);
            return next(err);
          }

          // Delete all orphaned alerts if any
          const orphanIds = _.map(orphans, item => item.id);
          if(!orphanIds.length) return next(null, resBody);

          sails.log("KongProxyHooks:upstreams:afterList:orphanIds", orphanIds);

          sails.models.upstreamalert.destroy({
            id: orphanIds
          }).exec(function (err) {
            if(err) {
              return next(err);
            }

            sails.log("KongProxyHooks:upstreams:afterList:Deleted alerts of upstreams", orphanIds);

            return next();
          });
        });


      },
      afterDelete: function(req, next) {
        if(!req.connection) return next();
        // The path must be of type /kong/<entityName>/<entityId>
        var entityId = req.path.replace("/kong","").split("/").filter(function (e) {
          return e;
        })[1];

        sails.models.upstreamalert.destroy({
          upstream_id: entityId
        }).exec(function (err) {
          if(err) {
            sails.log("KongProxyHooks:upstreams:afterDelete:Failed to delete alerts of upstream " + entityId);
            return next(err);
          }

          sails.log("KongProxyHooks:upstreams:afterDelete:Deleted alerts of upstream " + entityId);

          return next();
        });
      },
    }
  }


}

