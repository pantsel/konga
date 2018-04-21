/**
 * This file contains all necessary Angular controller definitions for 'frontend.login-history' module.
 *
 * Note that this file should only contain controllers and nothing else.
 */
(function() {
  'use strict';

  angular.module('frontend.routes')
    .controller('RouteHealthChecksController', [
      '$scope', '$log', '$state','RouteService','ServiceHCModel','$uibModal','MessageService','SettingsService',
      function controller($scope, $log, $state, RouteService, ServiceHCModel,$uibModal,MessageService,SettingsService) {


          $scope.toggleRouteHC = function() {

              RouteHCModel.update($scope.routeHC.id,{active: $scope.routeHC.active})
                  .then(function(updated){

                      MessageService.success("Health Checks " + ($scope.routeHC.active ? 'enabled' : 'disabled') + " ")
                  },function(err){
                      //
                  })
          }

          $scope.save = function() {
              if(!$scope.routeHC.health_check_endpoint) return false;
              RouteHCModel.update($scope.routeHC.id,$scope.routeHC)
                  .then(function(updated){
                      MessageService.success("Route health checks updated!")
                  },function(err){
                      //
                  })
          }

          function _fetchRouteHC() {
              RouteHCModel.load({
                  route_id : $scope.route.id,
                  limit : 1
              }).then(function(data){
                        if(!data.length) {
                            RouteHCModel.create({
                                "route_id" : $scope.route.id,
                                "route" : $scope.route,
                                "health_check_endpoint" : "",
                                "notification_endpoint" : "",
                                "active" : false
                            }).then(function(response){
                                $scope.routeHC = response.data
                            },function(err){
                                //
                            })
                        }else{
                            $scope.routeHC = data[0]
                        }
                  })
          }



          $scope.$on('route.health_checks',function(event,data){

              if(!$scope.routeHC) return false;
              if(data.hc_id == $scope.routeHC.id) {
                  $scope.routeHC.data = data
                  $scope.$apply()
              }

          })

          _fetchRouteHC()


      }
    ])
  ;
}());
