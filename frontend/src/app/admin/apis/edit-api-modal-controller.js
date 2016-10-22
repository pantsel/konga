/**
 * This file contains all necessary Angular controller definitions for 'frontend.admin.login-history' module.
 *
 * Note that this file should only contain controllers and nothing else.
 */
(function() {
  'use strict';

  angular.module('frontend.admin.apis')
    .controller('EditApiModalController', [
        '_','$scope','$rootScope','$log','MessageService','KongPluginsService','$uibModalInstance','ApiService','_api','_plugin',
      function controller(_,$scope,$rootScope,$log,MessageService,KongPluginsService,$uibModalInstance,ApiService,_api,_plugin ) {

          var pluginOptions = new KongPluginsService().pluginOptions()
          var options = pluginOptions[_plugin.name]

          $scope.plugin = _plugin
          $scope.api = _api
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



              ApiService.updatePlugin(_api.id,_plugin.id,data)
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

          function close() {
              $uibModalInstance.dismiss()
          }
      }
    ])
  ;
}());
