/**
 * This file contains all necessary Angular controller definitions for 'frontend.login-history' module.
 *
 * Note that this file should only contain controllers and nothing else.
 */
(function() {
  'use strict';

  angular.module('frontend.routes')
    .controller('RouteDetailsController', [
      '$scope', '$rootScope','$log', '$state','RouteService','$uibModal','MessageService','SettingsService',
      function controller($scope,$rootScope, $log, $state, RouteService, $uibModal,MessageService,SettingsService) {

          var availableFormattedVersion = RouteService.getLastAvailableFormattedVersion($rootScope.Gateway.version);
          $scope.settings = SettingsService.getSettings();
          $scope.partial = 'js/app/routes/partials/form-route-' + availableFormattedVersion + '.html?r=' + Date.now();

          $scope.updateRoute = function() {

              $scope.loading = true
              
              // workaround, name field creates constraint violation in v0.13.x
              delete $scope.route.name;
              
              RouteService.update($scope.route)
                  .then(function(res){
                      $log.debug("Update Route: ",res)
                      $scope.loading = false
                      MessageService.success('Route updated successfully!')
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
