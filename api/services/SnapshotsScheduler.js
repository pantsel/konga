'use strict';

var cron = require('node-cron');
var _ = require('lodash');
var tasks = {};
var semver = require('semver');
var KongService = require('./KongService')
var SnapshotsService = require('./SnapshotsService');
var Utils = require('../helpers/utils');

module.exports = {

  add: function (schedule) {

    if (!tasks[schedule.id]) {

      sails.log.debug("SnapshotScheduler:add", schedule);

      tasks[schedule.id] = cron.schedule(schedule.cron, function () {
        sails.log.debug("SnapshotScheduler:Running scheduled task", schedule);

        sails.models.kongnode.findOne(schedule.connection.id || schedule.connection)
          .exec(function (err, node) {
            if (err) {
              sails.log.error("SnapshotScheduler:Running scheduled task", "Failed to get node", err);
              return false;
            }

            if (!node) {
              sails.log.warn("SnapshotScheduler:Running scheduled task", "Node not found", schedule.connection);
              return false;
            }

            sails.log.error("SnapshotScheduler:Running scheduled task", "Fetch node", node);

            SnapshotsService.snapshot(null, node);

          });

      }, false);

      tasks[schedule.id].start();
    } else {
      sails.log.debug("SnapshotScheduler:add", "A schedule with the same id already exists");
    }
  },


  remove: function (schedule) {
    if (tasks[schedule.id]) {
      sails.log.debug("SnapshotScheduler:remove", "Removing schedule", schedule);
      tasks[schedule.id].destroy();
      delete tasks[schedule.id];
    }
  },


  takeSnapShot: function (node, cb) {


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

        // Foreach consumer get it's acls
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

              return cb();
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
            // Foreach upstream get its targets
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
                name: node.name + "@" + Date.now(),
                kong_node_name: node.name,
                kong_node_url: node.kong_admin_url,
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
              name: node.name + "@" + Date.now(),
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
