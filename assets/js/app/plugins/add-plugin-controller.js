/**
 * This file contains all necessary Angular controller definitions for 'frontend.admin.login-history' module.
 *
 * Note that this file should only contain controllers and nothing else.
 */
(function () {
  'use strict';

  angular.module('frontend.plugins')
    .controller('AddPluginController', [
      '_', '$scope', '$rootScope', '$log', '$state', 'ListConfig', 'ApiService',
      'MessageService', 'ConsumerModel', 'ServiceService', 'SocketHelperService', 'PluginHelperService',
      'KongPluginsService', '$uibModalInstance', 'PluginsService', '_pluginName', '_schema', '_context',
      function controller(_, $scope, $rootScope, $log, $state, ListConfig, ApiService,
                          MessageService, ConsumerModel, ServiceService, SocketHelperService, PluginHelperService,
                          KongPluginsService, $uibModalInstance, PluginsService, _pluginName, _schema,_context) {


        if(_.isArray(_context)) {
          _context.forEach(function (ctx) {
            $scope[ctx.name] = ctx.data;
          })
        }else if(_context){
          $scope[_context.name] = _context.data;
        }

        $scope.context = 'create';

        //var pluginOptions = new KongPluginsService().pluginOptions()
        var options = new KongPluginsService().pluginOptions(_pluginName)


        var sch = _schema.data;
        $scope.schema = {
          fields: {}
        };

        if(_.isArray(sch.fields)) {
          sch.fields.forEach(item => {
            $scope.schema.fields[Object.keys(item)[0]] = item[Object.keys(item)[0]];
          })
        }


        // $scope.schema = _schema.data
        $scope.pluginName = _pluginName
        console.log("Schema", $scope.schema)
        //$log.debug("Options", options)
        $scope.close = close

        // Define the plugins that will have their own custom form
        // so that it can be included via ng-include in the .html files
        $scope.customPluginForms = ['statsd'];

        $scope.humanizeLabel = function (key) {
          return key.split("_").join(" ");
        }


        function initialize() {
          // Initialize plugin fields data
          $scope.data = _.merge(options.fields, $scope.schema)

          // Define general modal window content
          $scope.description = $scope.data.meta ? $scope.data.meta.description
            : 'Configure the Plugin.'

          // Remove unwanted data fields that start with "_"
          Object.keys($scope.data.fields).forEach(function (key) {
            if (key.startsWith("_")) delete $scope.data.fields[key];
          })

          // Customize data fields according to plugin
          PluginHelperService.customizeDataFieldsForPlugin(_pluginName, $scope.data.fields)

          // Assign extra properties from options to data fields
          PluginHelperService.assignExtraProperties(_pluginName, options, $scope.data.fields);

          console.log("Extra properties added to fields =>", $scope.data.fields);
        }


        $scope.addCustomField = function (obj) {
          if (!obj.custom_field) {
            return;
          }
          if (!obj.custom_fields) {
            obj.custom_fields = {};
          }

          obj.custom_fields[obj.custom_field] = _.cloneDeep(obj.schema.fields)
          obj.custom_field = "";
        }

        $scope.removeCustomField = function (object, key) {
          delete object.custom_fields[key]
        }

        $scope.addPlugin = function (back) {

          $scope.busy = true;

          // Initialize request data
          var request_data = {
            name: _pluginName,
          }

          // Add api_id to request_data if defined
          if ($scope.api) {
            request_data.api = {
              id: $scope.api.id
            };
          }

          // Add service_id to request_data if defined
          if ($scope.service) {
            request_data.service = {
              id: $scope.service.id
            };
          }

          // Add route_id to request_data if defined
          if ($scope.route) {
            request_data.route = {
              id: $scope.route.id
            };
          }

          // If a consumer is defined, add consumer id to request data
          if ($scope.consumer) {
            request_data.consumer = {
              id: $scope.consumer.id
            };
          }

          // Overwrite consumer if explicitly set
          const explicitlySetConsumer = _.get($scope, 'data.consumer.id');
          if (explicitlySetConsumer) {
            request_data.consumer = {
              id: explicitlySetConsumer
            };
          }

          // Apply monkey patches to request data if needed
          PluginHelperService.applyMonkeyPatches(request_data, $scope.data.fields)

          // Create request data "config." properties
          var config = PluginHelperService.createConfigProperties(request_data.name,$scope.data.fields)

          request_data = _.merge(request_data, config || {})

          // Delete unset fields
          Object.keys(request_data).forEach(function (key) {
            if (!request_data[key]) delete request_data[key]
          })

          // Delete unset config fields
          if(request_data.config) {
            Object.keys(request_data.config).forEach(function (key) {
              if (!request_data.config[key]) delete request_data.config[key]
            })
          }


          console.log("REQUEST DATA =>", request_data)


          PluginHelperService.addPlugin(
            request_data,
            function success(res) {
              console.log("create plugin", res)
              $scope.busy = false;
              $rootScope.$broadcast('plugin.added', res.data)
              MessageService.success('Plugin added successfully!')
              $uibModalInstance.dismiss(res.data)
              if (back) $state.go('plugins');// return to plugins page if specified
            }, function (err) {
              $scope.busy = false;
              $log.error("create plugin", err)

              $scope.errors = {};
              const errorBody = _.get(err, 'data.body');
              if (errorBody) {
                if (errorBody.fields) {

                  for (let key in errorBody.fields) {
                    $scope.errors[key] = errorBody.fields[key]
                  }
                }
                $scope.errorMessage = errorBody.message || '';
              } else {
                $scope.errorMessage = "An unknown error has occured"
              }

              MessageService.error($scope.errorMessage);


            }, function evt(event) {
              // Only used for ssl plugin certs upload
              var progressPercentage = parseInt(100.0 * event.loaded / event.total);
              $log.debug('progress: ' + progressPercentage + '% ' + event.config.data.file.name);
            })
        }


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
         * -----------------------------------------------------------------------------------
         * CUSTOM FORMS LOGIC ADDITIONS
         * -----------------------------------------------------------------------------------
         */

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
    ]);
}());
