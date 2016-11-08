/**
 * This file contains all necessary Angular controller definitions for 'frontend.login-history' module.
 *
 * Note that this file should only contain controllers and nothing else.
 */
(function() {
  'use strict';

  angular.module('frontend.apis')
    .controller('EditApiController', [
      '$scope', '$log', '$state','ApiService','$uibModal','DialogService','_api',
      function controller($scope, $log, $state, ApiService, $uibModal,DialogService,_api ) {

          $scope.api = _api.data

          $scope.activeSection = 0;
          $scope.sections = [
              {
                  name : 'API Details',
                  icon : '&#xE88F;'
              },
              {
                  name : 'Assigned plugins',
                  icon : '&#xE8C1;'
              }
          ]

          $scope.showSection = function(index) {
              $scope.activeSection = index
          }


          $scope.updateApi = function() {

              $scope.loading = true
              ApiService.update($scope.api)
                  .then(function(res){
                      $log.debug("Update Api: ",res)
                      $scope.loading = false
                  }).catch(function(err){
                  $log.error("Update Api: ",err)
                  $scope.loading = false
              })

          }

      }
    ])
  ;
}());
