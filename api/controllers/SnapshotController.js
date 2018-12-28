/**
 * SnapshotController
 *
 * @description :: Server-side logic for managing snapshots
 * @help        :: See http://sailsjs.org/#!/documentation/concepts/Controllers
 */

const KongService = require('../services/KongService');
const SnapshotsService = require('../services/SnapshotsService');
const _ = require('lodash')
const async = require('async');
const fs = require('fs');
const semver = require('semver');

/**
 * Custom logic functions
 */

function makeResponseData(responseData, key)  {
  if (!responseData[key]) {
    responseData[key] = {
      imported: 0,
      failed: {
        count: 0,
        items: []
      }
    };
  }
}

function makeResponseDataError(responseData, entity, error) {
  responseData[entity].failed.count++;
  if (responseData[entity].failed.items.indexOf(_.get(error, 'body.message', JSON.stringify(error))) < 0) {
    responseData[entity].failed.items.push(_.get(error, 'body.message', JSON.stringify(error)))
  }
}

module.exports = _.merge(_.cloneDeep(require('../base/Controller')), {

  subscribe: function (req, res) {

    if (!req.isSocket) {
      sails.log.error("SnapshotsController:subscribe failed")
      return res.badRequest('Only a client socket can subscribe.');
    }

    var roomName = 'events.snapshots';
    sails.sockets.join(req.socket, roomName);
    res.json({
      room: roomName
    });
  },

  snapshot: async (req, res) => {
    // Get node
    sails.models.kongnode.findOne({
      id: req.param("node_id")
    }).exec(async (err, node) => {
      if (err) return res.negotiate(err)
      if (!node) return res.badRequest({
        message: "Invalid Kong Node"
      })
      try {
        const snapshot = await SnapshotsService.snapshot(req.param('name'), node);
        return res.json(snapshot);
      } catch (e) {
        return res.negotiate(e)
      }

    });
  },

  takeSnapShot: function (req, res) {

    // Get node
    sails.models.kongnode.findOne({
      id: req.param("node_id")
    }).exec(function (err, node) {
      if (err) return res.negotiate(err)
      if (!node) return res.badRequest({
        message: "Invalid Kong Node"
      })


      res.ok(); // Reply directly because snapshot creation may take some time

      SnapshotsService.takeSnapShot(req.param("name"), node, function (err, ok) {
        // Fire and forget.
        // Everything is handled by events and socket messages.

      });
    });
  },

  restore: async (req, res) => {

    const snaphsot_id = req.params.id;
    let responseData = {}

    sails.models.snapshot.findOne({
      id: snaphsot_id
    }).exec(async (err, snapshot) => {
      if (err) return res.negotiate(err)
      if (!snapshot) res.notFound({
        message: 'Snapshot not found'
      })

      // Fix put imports in correct order
      const requestedImports = req.param("imports") || Object.keys(snapshot.data);
      sails.log('SnapshotsController:restore:requestedImports', requestedImports);

      try {
        await Promise.all(requestedImports.map(async (entity) => {
          if (entity === 'consumers') {
            if (snapshot.data['consumers']) {
              makeResponseData(responseData, 'consumers');
              await Promise.all(snapshot.data['consumers'].map(async (consumer) => {
                try {
                  await KongService.put(`/${entity}/${consumer.id}`, req.connection, _.omit(consumer, ["id", "credentials"]));
                  responseData['consumers'].imported++;

                  // Apply credentials to the consumer
                  const plural2singularMAP = {
                    'basic-auths': 'basic-auth',
                    'key-auths': 'key-auth',
                    'hmac-auths': 'hmac-auth',
                    'jwts': 'jwt'
                  }
                  for (let key in consumer.credentials) {
                    makeResponseData(responseData, key);
                    if (consumer.credentials[key].length) {
                      await Promise.all(consumer.credentials[key].map(async (cred) => {
                        const singularKey = plural2singularMAP[key] || key;
                        try {
                          await KongService.post(`/consumers/${consumer.id}/${singularKey}`, req.connection, _.omit(cred, ["id", "consumer"]));
                          responseData[key].imported++;
                        } catch (e) {

                          makeResponseDataError(responseData, key, e);

                          if (e.statusCode && e.statusCode === 409) {
                            // A UNIQUE violation detected.
                            // That means the credential already exists.
                            sails.log(_.get(e, 'body.message'))
                          } else {
                            sails.log.error(`Create consumer credentials error =>`, e);
                          }
                        }
                      }));
                    }
                  }
                }catch (e) {
                  makeResponseDataError(responseData, 'consumers', e);
                }
              }));
            }

          } else if (entity === 'upstreams') {

            makeResponseData(responseData, 'upstreams');
            makeResponseData(responseData, 'upstream_targets');

            if (snapshot.data['upstreams']) {
              // Create upstreams
              await Promise.all(snapshot.data['upstreams'].map(async (upstream) => {
                try {
                  await KongService.put(`/upstreams/${upstream.id}`, req.connection, _.omit(upstream, ["id", "targets"]));
                  responseData['upstreams'].imported++;
                  // Create the upstream targets if needed
                  if (upstream.targets) {
                    await Promise.all(upstream.targets.map(async (target) => {
                      try {
                        await KongService.post(`/upstreams/${upstream.id}/targets`, req.connection, _.pick(target, ["target", "weight"]));
                        responseData['upstream_targets'].imported++;
                      } catch (e) {
                        makeResponseDataError(responseData, 'upstream_targets', e);
                        if (e.statusCode && e.statusCode === 409) {
                          // A UNIQUE violation detected.
                          // That means the credential already exists.
                          sails.log(_.get(e, 'body.message'))
                        } else {
                          sails.log.error(`Create upstream targets error =>`, e);
                        }
                      }
                    }));
                  }
                }catch (e) {
                  makeResponseDataError(responseData, 'upstreams', e);
                }
              }));
            }
          } else {
            if (snapshot.data[entity]) {
              makeResponseData(responseData, entity);

              await Promise.all(snapshot.data[entity].map(async (item) => {
                try {
                  await KongService.put(`/${entity}/${item.id}`, req.connection, _.omit(item, ["id", "extras"]));
                  responseData[entity].imported++;
                } catch (e) {

                  makeResponseDataError(responseData, entity, e);

                  if (e.statusCode && e.statusCode === 409) {
                    // A UNIQUE violation detected.
                    // That means the credential already exists.
                    sails.log(_.get(e, 'body.message'))
                  } else {
                    sails.log.error(`Create ${entity} error =>`, e);
                  }
                }
              }));
            }
          }
        }));
        return res.json(responseData);
      } catch (err) {
        sails.log.error(err);
        return res.negotiate(err);
      }
    });
  },

  // restore: function (req, res) {
  //
  //   var snaphsot_id = req.params.id
  //   var responseData = {}
  //   var self = this;
  //
  //   sails.models.snapshot.findOne({
  //     id: snaphsot_id
  //   }).exec(function (err, snapshot) {
  //     if (err) return res.negotiate(err)
  //     if (!snapshot) res.notFound({
  //       message: 'Snapshot not found'
  //     })
  //
  //     var fns = []
  //
  //     // Fix put imports in correct order
  //     var requestedImports = req.param("imports") || Object.keys(snapshot.data);
  //
  //     if (requestedImports.indexOf("upstream_targets") > -1 && requestedImports.indexOf("upstreams") < 0) {
  //       return res.badRequest({
  //         message: "Upstream targets cannot be restored without their respective upstreams. Check upstreams as well and try again."
  //       });
  //     }
  //
  //     var orderedEntities = ["apis", "consumers", "plugins", "upstreams", "upstream_targets"];
  //     var imports = _.filter(orderedEntities, function (entity) {
  //       return requestedImports.indexOf(entity) > -1;
  //     });
  //
  //
  //     sails.log("imports", imports);
  //
  //     if(requestedImports.indexOf("services") > -1) {
  //       self.importServices(responseData, fns, snapshot.data.services, req);
  //     }
  //
  //     imports.forEach(function (key) {
  //       snapshot.data[key].forEach(function (item) {
  //
  //         var path = null;
  //
  //         // Do some housekeeping - monkey patching.
  //         // Fixes bugs in prev versions.
  //         if (item.config) {
  //           if (item.config.anonymous === false || item.config.anonymous === 'false') {
  //             delete item.config.anonymous;
  //           }
  //         }
  //
  //         // Transform key in case of upstream targets
  //         if (key === 'upstream_targets') {
  //           path = "upstreams/" + item.upstream_id + "/targets";
  //         }
  //
  //
  //         fns.push(function (cb) {
  //
  //           // For consumers, we need to import their ACLSs and credentials as well
  //
  //           var consumerAcls = []
  //           var consumerCredentials = []
  //           var consumerPlugins = [];
  //
  //           if (key === "consumers") {
  //
  //             // Clean up the consumer object, by storing acls and credentials in different variables
  //             consumerAcls = _.cloneDeep(item.acls)
  //             consumerCredentials = _.cloneDeep(item.credentials)
  //             consumerPlugins = _.cloneDeep(item.plugins);
  //
  //             delete item.acls
  //             delete item.credentials
  //             delete item.plugins
  //
  //             sails.log("item", item);
  //
  //           }
  //
  //
  //           console.log("Create entity =>", "/" + (path || key), item)
  //           KongService.createFromEndpointCb("/" + (path || key), item, req, function (err, created) {
  //
  //             if (!responseData[key]) {
  //               responseData[key] = {
  //                 imported: 0,
  //                 failed: {
  //                   count: 0,
  //                   items: []
  //                 }
  //               };
  //             }
  //
  //             if (err) {
  //
  //               sails.log.error("Restore snapshot", "Failed to create", key, item.name, err.raw_body);
  //
  //               responseData[key].failed.count++;
  //               if (responseData[key].failed.items.indexOf(item.name) < 0) {
  //                 responseData[key].failed.items.push(item.name)
  //               }
  //               return cb();
  //             }
  //
  //
  //             if (key === 'consumers') {
  //               var consumerFns = []
  //               // Import acls
  //               consumerAcls.forEach(function (acl) {
  //                 consumerFns.push(function (cb) {
  //                   delete acl.consumer_id;
  //                   KongService.createFromEndpointCb("/" + key + "/" + created.id + "/acls", acl, req, function (err, created) {
  //
  //                     if (err) {
  //                       sails.log.error("Restore snapshot", "Failed to create", key, item.name, err.raw_body);
  //                       responseData[key].failed.count++
  //                       if (responseData[key].failed.items.indexOf(item.name) < 0) {
  //                         responseData[key].failed.items.push(item.name)
  //                       }
  //                       return cb()
  //                     }
  //                     return cb()
  //
  //                   });
  //                 })
  //               })
  //
  //               // Import plugins
  //               consumerPlugins.forEach(function (plugin) {
  //
  //                 consumerFns.push(function (cb) {
  //                   plugin.consumer_id = created.id;
  //                   KongService.createFromEndpointCb("/plugins", plugin, req, function (err, created) {
  //
  //                     if (err) {
  //                       sails.log.error("Restore snapshot", "Failed to create", key, item.username, err.raw_body);
  //                       responseData[key].failed.count++
  //                       if (responseData[key].failed.items.indexOf(item.name) < 0) {
  //                         responseData[key].failed.items.push(item.name)
  //                       }
  //                       return cb()
  //                     }
  //                     return cb()
  //
  //                   });
  //                 })
  //               })
  //
  //               // Import credentials
  //               Object.keys(consumerCredentials).forEach(function (credentialKey) {
  //
  //                 credentialKey, consumerCredentials[credentialKey].forEach(function (credentialData) {
  //
  //                   consumerFns.push(function (cb) {
  //                     delete credentialData.consumer_id;
  //                     KongService.createFromEndpointCb("/" + key + "/" + created.id + "/" + credentialKey, credentialData, req, function (err, created) {
  //
  //                       if (err) {
  //                         sails.log.error("Restore snapshot", "Failed to create", key, item.name, err.raw_body);
  //                         responseData[key].failed.count++
  //                         if (responseData[key].failed.items.indexOf(item.name) < 0) {
  //                           responseData[key].failed.items.push(item.name)
  //                         }
  //                         return cb()
  //                       }
  //                       return cb()
  //
  //                     });
  //                   })
  //                 })
  //
  //               })
  //
  //               async.series(consumerFns, function (err, data) {
  //                 responseData[key].imported++
  //                 return cb(null, data)
  //               })
  //             } else {
  //
  //               responseData[key].imported++
  //               return cb(null, responseData);
  //             }
  //
  //
  //           });
  //         });
  //       });
  //     })
  //
  //
  //     async.series(fns, function (err, data) {
  //       if (err) return res.negotiate(err)
  //       return res.ok(responseData);
  //     });
  //
  //   });
  // },

  importServices: function (responseData, fns, services, req) {
    var dataMap = {};
    var entityNames = ['services', 'routes', 'plugins'];
    var serviceRoutesMap = {};
    var servicePluginsMap = {};
    var routePluginsMap = {};


    _.forEach(entityNames, function (name) {
      fns.push(function (cb) {
        KongService.listAllCb(req, '/' + name, function (err, data) {
          if (err) {
            sails.log('Cloud not fetch ' + name);
            return cb(err);
          }
          dataMap[name] = data.data;
          return cb();
        });
      });
    });


    // Clean all the existing services, routes and plugins
    fns.push(function (cb) {
      var delFns = [];
      var orderedEntities = [
        {name: 'plugins', list: dataMap['plugins']},
        {name: 'routes', list: dataMap['routes']},
        {name: 'services', list: dataMap['services']}
      ];
      _.forEach(orderedEntities, function (entity) {
        var name = entity.name;
        _.forEach(entity.list, function (item) {
          if (name === 'plugins' && !item.route_id && !item.service_id) {
            return;
          }

          //sails.log('Deleting ' + name + ' :' + item.id);
          delFns.push(function (cb) {
            sails.log('Deleting ' + name + ' :' + item.id);
            KongService.deleteFromEndpointCb('/' + name + '/' + item.id, req, function (err, res) {
              if (err) {
                sails.log('Cloud not delete ' + name + ', id - ' + item.id + ' err: ' + JSON.stringify(err));
                return cb(err);
              }

              sails.log('Deleted ' + name);

              return cb();
            });
          });

        });
      });

      async.series(delFns, function (err, data) {
        return cb();
      });
    });


    _.forEach(services, function (service) {
      fns.push(function (cb) {
        var obj = _.omit(service, 'plugins', 'routes', 'id');
        KongService.createFromEndpointCb("/services", obj, req, function (err, res) {
          sails.log('Creating service complete');

          if (!responseData.services) responseData.services = {
            imported: 0,
            failed: {
              count: 0,
              items: []
            }
          }

          if (err) {
            sails.log('Cloud not create service ' + service.name + ' err: ' + JSON.stringify(err));
            responseData.services.failed.count++;
            return cb();
          }

          serviceRoutesMap[res.id] = service.routes;
          servicePluginsMap[res.id] = service.plugins;


          responseData.services.imported++

          return cb();
        });
      });
    });

    //Create routes
    fns.push(function (cb) {
      var routeFns = [];
      _.forEach(serviceRoutesMap, function (list, serviceId) {
        _.forEach(list, function (route) {
          routeFns.push(function (cb) {
            route.service = {id: serviceId};
            var obj = _.omit(route, 'plugins');
            KongService.createFromEndpointCb("/routes", obj, req, function (err, res) {

              if (!responseData.routes) responseData.routes = {
                imported: 0,
                failed: {
                  count: 0,
                  items: []
                }
              }

              if (err) {
                sails.log('Cloud not create route ' + route.paths);
                responseData.routes.failed.count++;
                return cb();
              }
              sails.log('Route creation complete: ' + route.paths);
              routePluginsMap[res.id] = route.plugins;


              responseData.routes.imported++

              return cb();
            });
          });

        });

      });

      async.series(routeFns, function (err, data) {
        return cb();
      });
    });

    //Create plugins for services
    fns.push(function (cb) {
      var pluginFns = [];
      _.forEach(servicePluginsMap, function (list, serviceId) {
        _.forEach(list, function (plugin) {
          pluginFns.push(function (cb) {
            var obj = _.omit(plugin, 'id', 'created_at');
            obj.service_id = serviceId;
            KongService.createFromEndpointCb("/plugins/", obj, req, function (err, res) {
              if (!responseData.servicePlugins) responseData.servicePlugins = {
                imported: 0,
                failed: {
                  count: 0,
                  items: []
                }
              }
              if (err) {
                sails.log('Cloud not create plugin  ' + plugin.name + ' for service ' + serviceId);
                responseData.servicePlugins.failed.count++;
                return cb();
              }

              sails.log('Route plugin created');

              responseData.servicePlugins.imported++
              return cb();
            });
          });

        });

      });

      async.series(pluginFns, function (err, data) {
        return cb();
      });
    });

    //Create plugins for routes
    fns.push(function (cb) {
      var pluginFns = [];
      _.forEach(routePluginsMap, function (list, routeId) {
        _.forEach(list, function (plugin) {
          pluginFns.push(function (cb) {
            var obj = _.omit(plugin, 'id', 'created_at');
            obj.route_id = routeId;
            sails.log('Creating Route plugin... ' + JSON.stringify(obj));
            KongService.createFromEndpointCb("/plugins/", obj, req, function (err, res) {
              if (!responseData.routePlugins) responseData.routePlugins = {
                imported: 0,
                failed: {
                  count: 0,
                  items: []
                }
              }
              if (err) {
                sails.log('Cloud not create plugin  ' + plugin.name + ' for route ' + routeId + ' err: ' + JSON.stringify(err));
                responseData.routePlugins.failed.count++;
                return cb();
              }

              sails.log('Route plugin created');

              responseData.routePlugins.imported++
              return cb();
            });
          });

        });

      });

      async.series(pluginFns, function (err, data) {
        return cb();
      });
    });


  },

  download: function (req, res) {
    var id = req.param('id');
    var SkipperDisk = require('skipper-disk');
    var fileAdapter = SkipperDisk(/* optional opts */);


    sails.models.snapshot.findOne({
      id: id
    }).exec(function (err, data) {
      if (err) return res.negotiate(err)
      if (!data) return res.notFound()

      var location = sails.config.paths.uploads + "snapshot_" + data.id + ".json";

      if (fs.existsSync(location)) {
        fileAdapter.read(location).on('error', function (err) {
          return res.negotiate(err);
        }).pipe(res);
      } else {
        fs.writeFile(location, JSON.stringify(data), 'utf8',
          function (err, file) {
            if (err) return res.negotiate(err)
            fileAdapter.read(location).on('error', function (err) {
              return res.negotiate(err);
            }).pipe(res);
          });
      }

    })
  }

});

