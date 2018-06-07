/**
 * This file contains all necessary Angular controller definitions for 'frontend.login-history' module.
 *
 * Note that this file should only contain controllers and nothing else.
 */
(function() {
  'use strict';

  angular.module('frontend.services')
    .controller('ServiceDetailsController', [
      '$scope', '$rootScope','$log', '$state','ServiceService','$uibModal','MessageService','SettingsService',
      function controller($scope,$rootScope, $log, $state, ServiceService, $uibModal,MessageService,SettingsService) {

          var availableFormattedVersion = ServiceService.getLastAvailableFormattedVersion($rootScope.Gateway.version);
          $scope.settings = SettingsService.getSettings();
          $scope.partial = 'js/app/services/partials/form-service-' + availableFormattedVersion + '.html?r=' + Date.now();

          $scope.updateService = function() {

              $scope.loading = true
              
              // workaround, name field creates constraint violation in v0.13.x
              // delete $scope.service.name;
              
              ServiceService.update($scope.service)
                  .then(function(res){
                      $log.debug("Update Service: ",res)
                      $scope.loading = false
                      MessageService.success('Service updated successfully!')
                  }).catch(function(err){
                      console.log("err",err)
                  $scope.loading = false
                  var errors = {}
                  Object.keys(err.data.body).forEach(function(key){
                      MessageService.error(key + " : " + err.data.body[key])
                  })
                  $scope.errors = errors
              })

          }

      }
    ])
  ;
}());
