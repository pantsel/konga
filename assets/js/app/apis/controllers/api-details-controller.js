/**
 * This file contains all necessary Angular controller definitions for 'frontend.login-history' module.
 *
 * Note that this file should only contain controllers and nothing else.
 */
(function() {
  'use strict';

  angular.module('frontend.apis')
    .controller('ApiDetailsController', [
      '$scope', '$log', '$state','ApiService','$uibModal','MessageService','SettingsService',
      function controller($scope, $log, $state, ApiService, $uibModal,MessageService,SettingsService) {


          $scope.settings = SettingsService.getSettings()
          $scope.updateApi = function() {

              $scope.loading = true
              ApiService.update($scope.api)
                  .then(function(res){
                      $log.debug("Update Api: ",res)
                      $scope.loading = false
                      MessageService.success('API updated successfully!')
                  }).catch(function(err){
                  $scope.loading = false
                  var errors = {}
                  Object.keys(err.data.customMessage).forEach(function(key){
                      errors[key.replace('config.','')] = err.data.customMessage[key]
                      MessageService.error(key + " : " + err.data.customMessage[key])
                  })
                  $scope.errors = errors
              })

          }

      }
    ])
  ;
}());
