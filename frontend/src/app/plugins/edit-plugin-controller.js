/**
 * This file contains all necessary Angular controller definitions for 'frontend.admin.login-history' module.
 *
 * Note that this file should only contain controllers and nothing else.
 */
(function() {
  'use strict';

  angular.module('frontend.plugins')
    .controller('EditPluginController', [
        '_','$scope','$rootScope','$log','MessageService','ConsumerModel','SocketHelperService',
        'KongPluginsService','$uibModalInstance','PluginsService','_plugin','_schema',
      function controller(_,$scope,$rootScope,$log,MessageService,ConsumerModel,SocketHelperService,
                          KongPluginsService,$uibModalInstance,PluginsService,_plugin,_schema ) {

          //var pluginOptions = new KongPluginsService().pluginOptions()
          var options = new KongPluginsService().pluginOptions(_plugin.name)

          $scope.plugin = _plugin
          $scope.schema = _schema.data
          $log.debug("Plugin",$scope.plugin)
          //$log.debug("Schema",$scope.schema)
          //$log.debug("Options", options)
          $scope.close = close



          // Populate resolved config values
          Object.keys(options).forEach(function(item){
              var value = _.get(_plugin,item)

              if($scope.plugin.name == 'datadog' && item == 'config.metrics') {
                  if(Object.keys(value).length == 0) {
                      options[item].value = []
                  }else{
                      options[item].value = $scope.plugin.config.metrics
                  }
              }else{
                  options[item].value = value
              }

          })


          // Monkey patch to help with transition
          // of using plugin schema directly from kong
          $scope.data = _.merge(options.fields,$scope.schema)
          $scope.description = $scope.data.meta ? $scope.data.meta.description : 'Configure the Plugin according to your specifications and add it to the API'
          Object.keys($scope.data.fields).forEach(function(item){
              var value = _.get(_plugin.config,item)

              if($scope.data.fields[item].type === 'array'
                  && value !== null && typeof value === 'object' && !Object.keys(value).length) {
                  value = []
              }

              $scope.data.fields[item].value = value
              $scope.data.fields[item].help = options[item].help

          })
          $log.debug("data",$scope.data)

          $scope.plugin.options = options



          $scope.updatePlugin = function() {

              $scope.busy = true;

              var data = {
                  enabled : $scope.plugin.enabled
              }

              for(var key in $scope.plugin.options) {

                  if($scope.plugin.name == 'datadog' && key == 'config.metrics') { // fix for datadog's metrics

                      try{
                          data[key] = $scope.plugin.options[key].value.join(",")
                      }catch(err){
                          data[key] = null
                      }


                  }else{
                      data[key] = $scope.plugin.options[key].value
                  }

              }



              PluginsService.update(_plugin.id,data)
                  .then(function(res){
                      $log.debug("updatePlugin",res)
                      $scope.busy = false;
                      $rootScope.$broadcast('plugin.updated',res.data)
                      MessageService.success('"' + _plugin.name + '" plugin updated successfully!')
                      $uibModalInstance.dismiss()
                  }).catch(function(err){
                  $scope.busy = false;
                  $log.error("updatePlugin",err)
                  $scope.errors = err.data.customMessage || {}
              })
          }



          // Add the consumers to the plugin options
          $scope.getConsumer = function(val) {

              // Initialize filters
              $scope.filters = {
                  searchWord: val || '',
                  columns: ['username','custom_id']
              };

              var commonParameters = {
                  where: SocketHelperService.getWhere($scope.filters)
              };

              return ConsumerModel
                  .load(_.merge({}, commonParameters, {}))
                  .then(function(response){
                      return response.map(function(item){
                          return item;
                      });
                  });
          };

          function close() {
              $uibModalInstance.dismiss()
          }
      }
    ])
  ;
}());
