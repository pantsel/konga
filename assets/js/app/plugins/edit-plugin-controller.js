/**
 * This file contains all necessary Angular controller definitions for 'frontend.admin.login-history' module.
 *
 * Note that this file should only contain controllers and nothing else.
 */
(function () {
  'use strict';

  angular.module('frontend.plugins')
    .controller('EditPluginController', [
      '_', '$scope', '$rootScope', '$log', 'ListConfig',
      'MessageService', 'ConsumerModel', 'SocketHelperService', 'PluginHelperService',
      'KongPluginsService', '$uibModalInstance', 'PluginsService', '_plugin', '_schema',
      function controller(_, $scope, $rootScope, $log, ListConfig,
                          MessageService, ConsumerModel, SocketHelperService, PluginHelperService,
                          KongPluginsService, $uibModalInstance, PluginsService, _plugin, _schema) {

        $scope.plugin = _plugin;

        var sch = _schema.data;
        $scope.schema = {
          fields: {}
        };

        if(_.isArray(sch.fields)) {
          sch.fields.forEach(item => {
            $scope.schema.fields[Object.keys(item)[0]] = item[Object.keys(item)[0]];
          })
        }

        // $scope.schema = _schema.data;
        $scope.context = 'update';
        console.log("Plugin", $scope.plugin);
        console.log("Schema", $scope.schema);

        //var pluginOptions = new KongPluginsService().pluginOptions()
        var options = new KongPluginsService().pluginOptions(_plugin.name);

        // Define the plugins that will have their own custom form
        // so that it can be included via ng-include in the .html files
        $scope.customPluginForms = ['statsd'];


        //$log.debug("Options", options)
        $scope.close = close;


        $scope.humanizeLabel = function (key) {
          return key.split("_").join(" ");
        };

        $scope.addFlexField = function (fields, v) {
          if (!v.flex_field) return;

          fields[v.flex_field] = {
            "schema": {
              "fields": {
                "day": {
                  "type": "number",
                },
                "minute": {
                  "type": "number",
                },
                "second": {
                  "type": "number",
                },
                "year": {
                  "type": "number",
                },
                "month": {
                  "type": "number",
                },
                "hour": {
                  "type": "number",
                }
              }
            }
          };

          v.flex_field = ""
        };

        $scope.removeField = function (object, key) {
          delete object[key];
        };

        function initialize() {
          // Initialize plugin fields data
          $scope.data = _.merge(options.fields, $scope.schema, {
            consumer: {
              id: _.get($scope, 'plugin.consumer.id')
            }
          });


          // Define general modal window content
          $scope.description = $scope.data.meta ? $scope.data.meta.description
            : 'Configure the Plugin.';

          // Remove unwanted data fields that start with "_"
          Object.keys($scope.data.fields).forEach(function (key) {
            if (key.startsWith("_")) delete $scope.data.fields[key];
          });

          // Monkey patch for response-ratelimiting plugin
          if (_plugin.name === 'response-ratelimiting') {
            console.log("response-ratelimiting:limits =>", _plugin.config.limits);

            // Delete initial schema fields
            delete $scope.data.fields.limits.schema.fields.day;
            delete $scope.data.fields.limits.schema.fields.hour;
            delete $scope.data.fields.limits.schema.fields.minute;
            delete $scope.data.fields.limits.schema.fields.month;
            delete $scope.data.fields.limits.schema.fields.second;
            delete $scope.data.fields.limits.schema.fields.year;


            if (_plugin.config.limits) {
              Object.keys(_plugin.config.limits).forEach(function (key) {

                //console.log("_plugin.config.limits[key]",_plugin.config.limits[key])

                var inner_fields = {};
                Object.keys(_plugin.config.limits[key]).forEach(function (k) {
                  inner_fields[k] = {
                    type: 'number',
                    default: _plugin.config.limits[key][k]
                  }
                });

                $scope.data.fields.limits.schema.fields[key] = {

                  schema: {
                    fields: inner_fields
                  }
                }
              })
            }
          }

          // Customize data fields according to plugin
          PluginHelperService.customizeDataFieldsForPlugin(_plugin.name, $scope.data.fields);

          assignValues($scope.data.fields);
        }


        function assignValues(fields, prefix) {

          Object.keys(fields).forEach(function (item) {
            if (fields[item].schema) {
              assignValues(fields[item].schema.fields, prefix ? prefix + "." + item : item)
            } else {

              var path = prefix ? prefix + "." + item : item;
              var value = _.get(_plugin.config, path);

              if (fields[item].type === 'record' && fields[item].fields) {
                fields[item].fields.forEach(field => {
                  const prop = Object.keys(field)[0];
                  field[prop].value = _.get(_plugin.config, `${path}.${prop}`);
                })
              }

              if (fields[item].type === 'array'
                && value !== null && typeof value === 'object' && !Object.keys(value).length) {
                value = []
              }
              fields[item].value = value;
              fields[item].help = _.get(options, path) ? _.get(options, path).help : ''
            }
          });
        }


        $scope.updatePlugin = function () {

          $scope.busy = true;


          var data = _.omit($scope.plugin, ['config']);

          //if($scope.data.consumer_id instanceof Object) {
          //    data.consumer_id = $scope.data.consumer_id.id
          //}

          const consumerId = _.get($scope, 'data.consumer.id');
          if (consumerId) {
            data.consumer = {
              id: consumerId
            };
          }


          // Create request data "config." properties
          const config = PluginHelperService.createConfigProperties(_plugin.name,$scope.data.fields)

          const finalData = _.merge(data, config)

          console.log("REQUEST DATA =>", finalData);

          PluginsService.update(_plugin.id, finalData)
            .then(function (res) {
              $log.debug("updatePlugin", res);
              $scope.busy = false;
              $rootScope.$broadcast('plugin.updated', res.data);
              MessageService.success('"' + _plugin.name + '" plugin updated successfully!');
              $uibModalInstance.close({
                data: res.data
              });
            }).catch(function (err) {
            $scope.busy = false;
            $log.error("update plugin", err);
            var errors = {};

            if (err.data.customMessage) {
              Object.keys(err.data.customMessage).forEach(function (key) {
                errors[key.replace('config.', '')] = err.data.customMessage[key];
                MessageService.error(key + " : " + err.data.customMessage[key])
              })
            } else if (err.data.body && err.data.body.message) {
              MessageService.error(err.data.body.message)
            }

            $scope.errors = errors
          })
        };


        // Initialize used title items
        $scope.titleItems = ListConfig.getTitleItems(ConsumerModel.endpoint);

        // Add the consumers to the plugin options
        $scope.getConsumer = function (val) {

          if (!val) return;

          var commonParameters = {
            where: SocketHelperService.getWhere({
              searchWord: val,
              columns: $scope.titleItems
            })
          };

          return ConsumerModel
            .load(_.merge({}, commonParameters, {
              limit: 5
            }))
            .then(function (response) {
              return response.map(function (item) {
                return item;
              });
            });
        };

        function close() {
          $uibModalInstance.dismiss()
        }

        initialize();


        /**
         * STATSD
         */

        $scope.statsd = {
          metricNames : [
            'request_count',
            'request_size',
            'response_size',
            'latency',
            'status_count',
            'unique_users',
            'request_per_user',
            'upstream_latency',
            'kong_latency',
            'status_count_per_user'
          ],
          statTypes : [
            'gauge',
            'timer',
            'counter',
            'histogram',
            'meter',
            'set'
          ],
          consumerIndentifiers : [
            'consumer_id',
            'custom_id',
            'username'
          ],
          addMetric : function (metrics) {

            var template = {
              name : 'upstream_latency',
              stat_type: 'gauge',
              custom_identifier: 'consumer_id'
            };

            metrics.push(template);

          },
          removeMetric: function (metrics, index) {
            metrics.splice(index,1);
          }
        };

        $scope.getFieldProp = (field) => {
          return Object.keys(field)[0];
        }
      }
    ])
  ;
}());
