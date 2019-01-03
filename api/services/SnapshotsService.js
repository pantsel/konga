'use strict';

var cron = require('node-cron');
var _ = require('lodash');
var semver = require('semver');
var KongService = require('./KongService');
var async = require('async');
var Utils = require('../helpers/utils');

module.exports = {

  snapshot: async(snapshotName, node) => {


    const entities = {
      'services': [],
      'routes': [],
      'consumers': [],
      'plugins': [],
      'acls': [],
      'upstreams': [],
      'certificates': [],
      'snis': []
    };
    const req = {
      connection: node
    }

    const consumersCredentials = {
      'basic-auths': [],
      'key-auths': [],
      'hmac-auths': [],
      'jwts': [],
      'oauth2': []
    }

    try {

      const nodeInfo = await KongService.info(node);

      // Take in account only the plugins enabled in the cluster
      // ToDo: clean this up somehow
      if(nodeInfo.plugins.enabled_in_cluster.indexOf('basic-auth') < 0) { delete consumersCredentials['basic-auths']}
      if(nodeInfo.plugins.enabled_in_cluster.indexOf('key-auth') < 0) { delete consumersCredentials['key-auths'] }
      if(nodeInfo.plugins.enabled_in_cluster.indexOf('hmac-auth') < 0) { delete consumersCredentials['hmac-auths'] }
      if(nodeInfo.plugins.enabled_in_cluster.indexOf('jwt') < 0) { delete consumersCredentials['jwts'] }
      if(nodeInfo.plugins.enabled_in_cluster.indexOf('oauth2') < 0) { delete consumersCredentials['oauth2'] }


      // Gather entities
      for(let entity in entities) {
        const result = await KongService.fetch(`/${entity}`, req);
        if(result) {
          entities[entity] = result.data;

          // For each upstream, fetch it's targets
          if(entity === 'upstreams' && result.data.length) {
            entities[entity].forEach(async (upstream) => {
              const targets = await KongService.fetch(`/upstreams/${upstream.id}/targets`, req);
              upstream.targets = targets.data;
            })
          }
        }

      }

      // Gather consumer credentials
      for(let credential in consumersCredentials) {
        const result = await KongService.fetch(`/${credential}`, req);
        consumersCredentials[credential] = result.data;
      }

      // Assign credentials to consumers
      if(entities.consumers && entities.consumers.length) {
        entities.consumers.forEach(consumer => {
          consumer.credentials = {};
          for(let key in consumersCredentials) {
            consumer.credentials[key] = _.filter(consumersCredentials[key], (item) => {
              return consumer.id === _.get(item, 'consumer.id');
            })
          }
        })
      }

      sails.log("SnapshotController:snapshot:entities", entities);

      // Create the actual snapshot
      return new Promise((resolve, reject) => {
        sails.models.snapshot.create({
          name: snapshotName || "snap@" + Date.now(),
          kong_node_name: node.name,
          kong_node_url: Utils.withoutTrailingSlash(node.kong_admin_url),
          kong_version: node.kong_version,
          data: entities
        }).exec(function (err, created) {
          if (err) return reject(err);
          return resolve(created);
        });
      })
    } catch(err) {
      throw err;
    }
  },

  takeSnapShot: function (name, node, cb) {


    // Get node
    KongService.nodeInfo(node, function (err, status) {
      if (err) {
        return cb(err);
      }

      var result = {}

      var endpoints = ['/apis', '/plugins', '/consumers']

      status.version = Utils.ensureSemverFormat(status.version);

      if (semver.gte(status.version, '0.10.0')) {
        endpoints = endpoints.concat(['/upstreams']);
      }

      if (semver.gte(status.version, '0.13.0')) {
        endpoints = endpoints.concat(['/services', '/routes']);
      }


      var fns = []

      endpoints.forEach(function (endpoint) {
        fns.push(function (cb) {
          KongService.listAllCb(node, endpoint, function (err, data) {
            if (err) {
              return cb(err);
            }
            result[endpoint.replace("/", "")] = data.data
            return cb();
          });
        });
      });


      async.series(fns, function (err, data) {
        if (err) {
          return cb(err);
        }


        var servicePluginsMap = {};
        var consumerPluginsMap = {};
        var routePluginsMap = {};
        var pluginsUpdated = [];
        var routesUpdated = [];


        _.forEach(result.plugins, function (plugin) {
          if (plugin.service_id) {

            if (!(plugin.service_id in servicePluginsMap)) {
              servicePluginsMap[plugin.service_id] = [];
            }
            servicePluginsMap[plugin.service_id].push(plugin);

          } else if (plugin.route_id) {

            if (!(plugin.route_id in routePluginsMap)) {
              routePluginsMap[plugin.route_id] = [];
            }
            routePluginsMap[plugin.route_id].push(plugin);

          } else if(plugin.consumer_id) {
            if (!(plugin.consumer_id in consumerPluginsMap)) {
              consumerPluginsMap[plugin.consumer_id] = [];
            }
            consumerPluginsMap[plugin.consumer_id].push(plugin);
          } else {
            pluginsUpdated.push(plugin);
          }
        });

        result.plugins = pluginsUpdated;

        _.forEach(servicePluginsMap, function (arr, service_id) {
          var service = _.find(result.services, {id: service_id});

          if (service) {
            service.plugins = arr
          }

        });

        _.forEach(routePluginsMap, function (arr, route_id) {
          var route = _.find(result.routes, {id: route_id});

          if (route) {
            route.plugins = arr
          }
        });

        _.forEach(result.routes, function (route) {
          var routes = routesUpdated;
          if (route.service && route.service.id) {
            var service = _.find(result.services, {id: route.service.id});

            if (service) {
              if (!service.routes) {
                service.routes = [];
              }
              routes = service.routes;
            }
          }
          routes.push(route);
        });

        result.routes = [];


        // Foreach consumer get it's acls & plugins
        var consumerFns = []
        result.consumers.forEach(function (consumer) {
          consumerFns.push(function (cb) {
            KongService.listAllCb(node, '/consumers/' + consumer.id + '/acls', function (err, data) {
              if (err) {
                return cb();
              }
              sails.log(data)
              if (!consumer.acls) {
                consumer.acls = [];
              }
              data.data.forEach(function (item) {
                consumer.acls.push(item);
              })

              // Also get the consumer's plugins
              KongService.listAllCb(node, '/consumers/' + consumer.id + '/plugins', function (err, data) {
                if (err) {
                  return cb();
                }
                sails.log(data)
                if (!consumer.plugins) {
                  consumer.plugins = [];
                }
                data.data.forEach(function (item) {
                  consumer.plugins.push(item);
                })

                return cb();
              });
            });
          })


          var credentials = ["basic-auth", "key-auth", "hmac-auth", "jwt", "oauth2"]
          credentials.forEach(function (credential) {
            consumerFns.push(function (cb) {
              KongService.listAllCb(node, '/consumers/' + consumer.id + '/' + credential, function (err, data) {
                if (err) {
                  return cb();
                }
                if (!consumer.credentials) {
                  consumer.credentials = {};
                }
                if (!consumer.credentials[credential]) {
                  consumer.credentials[credential] = [];
                }
                data.data.forEach(function (item) {
                  consumer.credentials[credential].push(item);
                })

                return cb();
              });
            });
          });
        })

        async.series(consumerFns, function (err, data) {
          if (err) {
            return cb(err);
          }

          if (semver.gte(status.version, '0.10.0')) {
            // Foreach upstream get it's targets
            var fns = []
            result.upstreams.forEach(function (upstream) {
              fns.push(function (cb) {
                KongService.listAllCb(node, '/upstreams/' + upstream.id + '/targets', function (err, data) {
                  if (err) return cb()
                  sails.log(data.data)
                  if (!result.upstream_targets) result.upstream_targets = []
                  data.data.forEach(function (item) {
                    result.upstream_targets.push(item);
                  })

                  return cb();
                });
              });
            })


            async.series(fns, function (err, data) {
              if (err) {
                return cb(err);
              }


              sails.models.snapshot.create({
                name: name || "snap@" + Date.now(),
                kong_node_name: node.name,
                kong_node_url: Utils.withoutTrailingSlash(node.kong_admin_url),
                kong_version: status.version,
                data: result
              }).exec(function (err, created) {
                if (err) {
                  sails.sockets.blast('events.snapshots', {
                    verb: 'failed',
                    data: {
                      name: node.name + "@" + Date.now()
                    }
                  });
                }

              });
            })
          } else {
            sails.models.snapshot.create({
              name: name || "snap@" + Date.now(),
              kong_node_name: node.name,
              kong_version: node.kong_version,
              data: result
            }).exec(function (err, created) {
              if (err) {
                sails.sockets.blast('events.snapshots', {
                  verb: 'failed',
                  data: {
                    name: node.name + "@" + Date.now()
                  }
                });
              }

            });
          }
        });
      });

    });
  },

}
