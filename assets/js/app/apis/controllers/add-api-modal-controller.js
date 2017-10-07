/**
 * This file contains all necessary Angular controller definitions for 'frontend.login-history' module.
 *
 * Note that this file should only contain controllers and nothing else.
 */
(function() {
  'use strict';

  angular.module('frontend.apis')
    .controller('AddApiModalController', [
      '$scope', '$rootScope','$log', '$state','ApiService','SettingsService',
        '$uibModalInstance','MessageService',
      function controller($scope,$rootScope, $log, $state, ApiService, SettingsService,
                          $uibModalInstance, MessageService ) {


          var availableFormattedVersion = ApiService.getLastAvailableFormattedVersion($rootScope.Gateway.version);
          $scope.api = angular.copy(ApiService.getProperties($rootScope.Gateway.version));

          $scope.partial = 'js/app/apis/partials/form-api-' + availableFormattedVersion + '.html?r=' + Date.now();

          $log.debug("$scope.api",$scope.api)

          $scope.close = function() {
              $uibModalInstance.dismiss()
          }



          $scope.submit = function() {

              clearApi()


              ApiService.add($scope.api)
                  .then(function(res){
                      $rootScope.$broadcast('api.created')
                      MessageService.success('Api created!')
                      $uibModalInstance.dismiss()
                  }).catch(function(err){
                  $log.error("Create new api error:", err)
                  MessageService.error("Submission failed. Make sure you have completed all required fields.")
                  $scope.errors = {}
                  if(err.data && err.data.body){
                      Object.keys(err.data.body).forEach(function(key){
                          $scope.errors[key] = err.data.body[key]
                      })
                  }
              })
          }


          function clearApi() {
              for(var key in $scope.api) {
                  if($scope.api[key] === '') {
                      delete($scope.api[key])
                  }
              }
          }


      }
    ])
  ;
}());
