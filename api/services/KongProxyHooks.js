'use strict';

var _ = require('lodash');

var self = module.exports = {

  /**
   * Before Hooks
   * ToDo: apply more Hooks when needed
   */


  beforeEntityUpdate: function(entityName, entityId, connectionId, data, next) {
    sails.log.debug("KongProxyHooks:beforeEntityUpdate called()");
    if(!entityName || !data.extras || !sails.models["kong" + entityName]) return next(null, data);

    sails.models["kong" + entityName].updateOrCreate({
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

  /**
   * After Hooks
   * ToDo: apply more Hooks when needed
   */

  afterEntityRetrieve: function(entityName, req, data, next) {
    if(data.data && data.data instanceof Array) { // This is a listing request. We must apply correlations recursively.
      return self.afterEntityList(entityName, req, data, next);
    }
    return self.afterEntityFetch(entityName, req, data, next);
  },

  afterEntityFetch: function(entityName, req, data, next) {
    sails.log.debug("KongProxyHooks:beforeEntityFetch called()", entityName);
    if(!entityName || !sails.models["kong" + entityName]) return next(null, data);

    var connectionId = req.connection.id;
    var entityId = req.path.split("/").filter(function (e) {
      return e;
    })[1];

    sails.models["kong" + entityName].findOne({
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

  afterEntityList: function(entityName, req, resBody, next) {
    sails.log.debug("KongProxyHooks:afterEntityList called()", entityName);
    if(!entityName || !sails.models["kong" + entityName]) return next(null, resBody);

    var connectionId = req.connection.id;

    sails.models["kong" + entityName].find({
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

  afterEntityCreate: function(entityName, req, data, konga_extras, next) {
    sails.log.debug("KongProxyHooks:afterEntityCreate called()", entityName);
    if(!entityName || !sails.models["kong" + entityName]) return next(null, data);

    var connectionId = req.connection.id;
    var entityId = data.id;

    sails.models["kong" + entityName].create(_.merge({
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

  afterEntityDelete: function(entityName, req, next) {

    sails.log.debug("KongProxyHooks:afterEntityDelete called()", entityName);
    if(!entityName || !sails.models["kong" + entityName]) return next();

    var connectionId = req.connection.id;
    // The path must be of type /kong/<entityName>/<entityId>
    var entityId = req.path.replace("/kong","").split("/").filter(function (e) {
      return e;
    })[1];

    sails.models["kong" + entityName].destroy({
      kong_node_id: connectionId,
      service_id: entityId
    },function (err) {
      if(err) {
        sails.log.error("Failed to remove kong service extras",err);
        return next(err);
      }

      return next();
    })
  }


}

