/**
 * This file contains all necessary Angular controller definitions for 'frontend.login-history' module.
 *
 * Note that this file should only contain controllers and nothing else.
 */
(function() {
  'use strict';

  angular.module('frontend.routes')
    .controller('AddRouteModalController', [
      '$scope', '$rootScope','$log', '$state','RouteService','SettingsService',
        '$uibModalInstance','MessageService',
      function controller($scope,$rootScope, $log, $state, RouteService, SettingsService,
                          $uibModalInstance, MessageService ) {


          var availableFormattedVersion = RouteService.getLastAvailableFormattedVersion($rootScope.Gateway.version);
          $scope.route = angular.copy(RouteService.getProperties($rootScope.Gateway.version));

          $scope.partial = 'js/app/routes/partials/form-route-add-' + availableFormattedVersion + '.html?r=' + Date.now();

          $log.debug("$scope.route",$scope.route)

          $scope.close = function() {
              $uibModalInstance.dismiss()
          }



          $scope.submit = function() {

              clearRoute()


              RouteService.add($scope.route)
                  .then(function(res){
                      $rootScope.$broadcast('route.created')
                      MessageService.success('Route created!')
                      $uibModalInstance.dismiss()
                  }).catch(function(err){
                  $log.error("Create new route error:", err)
                  MessageService.error("Submission failed. Make sure you have completed all required fields.")
                  $scope.errors = {}
                  if(err.data && err.data.body){
                      Object.keys(err.data.body).forEach(function(key){
                          $scope.errors[key] = err.data.body[key]
                      })
                  }
              })
          }


          function clearRoute() {
              for(var key in $scope.route) {
                  if($scope.route[key] === '') {
                      delete($scope.route[key])
                  }
              }
          }


      }
    ])
  ;
}());
