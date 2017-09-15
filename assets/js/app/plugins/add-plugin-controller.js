/**
 * This file contains all necessary Angular controller definitions for 'frontend.admin.login-history' module.
 *
 * Note that this file should only contain controllers and nothing else.
 */
(function() {
  'use strict';

  angular.module('frontend.plugins')
    .controller('AddPluginController', [
        '_','$scope','$rootScope','$log','$state','ListConfig','ApiService',
        'MessageService','ConsumerModel','SocketHelperService','PluginHelperService',
        'KongPluginsService','$uibModalInstance','PluginsService','_pluginName','_schema','_api','_consumer',
      function controller(_,$scope,$rootScope,$log,$state,ListConfig,ApiService,
                          MessageService,ConsumerModel,SocketHelperService,PluginHelperService,
                          KongPluginsService,$uibModalInstance,PluginsService,_pluginName,_schema,_api,_consumer ) {


          $scope.api = _api
          $scope.consumer = _consumer;
          $log.debug("API",$scope.api)

          //var pluginOptions = new KongPluginsService().pluginOptions()
          var options = new KongPluginsService().pluginOptions(_pluginName)

          $scope.schema = _schema.data
          $scope.pluginName = _pluginName
          $log.debug("Schema",$scope.schema)
          //$log.debug("Options", options)
          $scope.close = close

          $scope.humanizeLabel = function(key) {
              return key.split("_").join(" ")
          }



          function initialize() {
              // Initialize plugin fields data
              $scope.data = _.merge(options.fields,$scope.schema)


              // Define general modal window content
              $scope.description = $scope.data.meta ? $scope.data.meta.description
                  : 'Configure the Plugin.'

              // Remove unwanted data fields that start with "_"
              Object.keys($scope.data.fields).forEach(function(key){
                  if(key.startsWith("_")) delete $scope.data.fields[key]
              })

              // Customize data fields according to plugin
              PluginHelperService.customizeDataFieldsForPlugin(_pluginName,$scope.data.fields)

              // Assign extra properties from options to data fields
              PluginHelperService.assignExtraProperties(options,$scope.data.fields);

              console.log("Extra properties added to fields =>",$scope.data.fields);
          }



          $scope.addCustomField = function(obj) {
              if(!obj.custom_field) {
                  return;
              }
              if(!obj.custom_fields) {
                  obj.custom_fields = {};
              }

              obj.custom_fields[obj.custom_field] = _.cloneDeep(obj.schema.fields)
              obj.custom_field = "";
          }

          $scope.removeCustomField = function(object,key) {
              delete object.custom_fields[key]
          }

          $scope.addPlugin = function(back) {

              $scope.busy = true;

              // Initialize request data
              var request_data = {
                  name : _pluginName,
              }

              // Add api_id to request_data if defined
              if($scope.api) {
                  request_data.api_id = $scope.api.id;
              }

              // If a consumer is defined, add consumer_id to request data
              if($scope.consumer) {
                  request_data.consumer_id = $scope.consumer.id;
              }

              if($scope.data.consumer_id) { // Overwrite consumer if explicitly set
                  request_data.consumer_id = $scope.data.consumer_id;
              }

              // Apply monkey patches to request data if needed
              PluginHelperService.applyMonkeyPatches(request_data,$scope.data.fields)

              // Create request data "config." properties
              var config = PluginHelperService.createConfigProperties($scope.data.fields)

              request_data = _.merge(request_data,config)

              // Delete unset fields
              Object.keys(request_data).forEach(function(key){
                  if(!request_data[key]) delete request_data[key]
              })

              console.log("REQUEST DATA =>",request_data)

              PluginHelperService.addPlugin(
                  request_data,
                  function success(res){
                      console.log("create plugin",res)
                      $scope.busy = false;
                      $rootScope.$broadcast('plugin.added',res.data)
                      MessageService.success('Plugin added successfully!')
                      $uibModalInstance.dismiss(res.data)
                      if(back) $state.go('plugins') // return to plugins page if specified
                  },function(err){
                      $scope.busy = false;
                      $log.error("create plugin",err)
                      var errors = {}

                      if(err.data.customMessage) {
                          Object.keys(err.data.customMessage).forEach(function(key){
                              errors[key.replace('config.','')] = err.data.customMessage[key]
                              MessageService.error(key + " : " + err.data.customMessage[key])
                          })
                      }

                      if(err.data.body) {
                          Object.keys(err.data.body).forEach(function(key){
                              errors[key] = err.data.body[key]
                              MessageService.error(key + " : " + err.data.body[key])
                          })
                      }
                      $scope.errors = errors
                  },function evt(event){
                      // Only used for ssl plugin certs upload
                      var progressPercentage = parseInt(100.0 * event.loaded / event.total);
                      $log.debug('progress: ' + progressPercentage +'% ' + event.config.data.file.name);
                  })
          }



          // Initialize used title items
          $scope.titleItems = ListConfig.getTitleItems(ConsumerModel.endpoint);

          // Add the consumers to the plugin options
          $scope.getConsumer = function(val) {

              if(!val) return;

              var commonParameters = {
                  where: SocketHelperService.getWhere({
                      searchWord: val,
                      columns:  $scope.titleItems
                  })
              };

              return ConsumerModel
                  .load(_.merge({}, commonParameters, {
                      limit : 5
                  }))
                  .then(function(response){
                      return response.map(function(item){
                          return item;
                      });
                  });
          };

          function close() {
              $uibModalInstance.dismiss()
          }


          initialize();
      }
    ]);
}());
