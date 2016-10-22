/**
 * This file contains all necessary Angular controller definitions for 'frontend.admin.login-history' module.
 *
 * Note that this file should only contain controllers and nothing else.
 */
(function() {
  'use strict';

  angular.module('frontend.admin.apis')
    .controller('AddApiPluginController', [
        '_','$scope','$rootScope',
        '$log','MessageService','KongPluginsService',
        '$uibModalInstance','ApiService','_api','_plugin',
      function controller(_,$scope,$rootScope,
                          $log,MessageService,KongPluginsService,
                          $uibModalInstance,ApiService,_api,_plugin) {

          $scope.plugin = {
              name : _plugin,
              options : new KongPluginsService().pluginOptions(_plugin)
          }


          $scope.api = _api
          $scope.close = function() {
              $uibModalInstance.dismiss()
          }

          $scope.addPlugin = function() {

              $scope.busy = true;
              var data = {
                  name : $scope.plugin.name
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

              ApiService.addPlugin(_api.id,data)
                  .then(function(res){
                      $log.debug("addPlugin",res)
                      $scope.busy = false;
                      $rootScope.$broadcast('plugin.added')
                      MessageService.success('"' + $scope.plugin.name + '" plugin added successfully!')
                      $uibModalInstance.dismiss()
                  }).catch(function(err){
                  $log.error("addPlugin:", err)
                  $scope.busy = false;
                  $scope.errors = err.data.customMessage || {}
              })


          }


      }
    ])
  ;
}());
