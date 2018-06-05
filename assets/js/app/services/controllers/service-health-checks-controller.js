/**
 * This file contains all necessary Angular controller definitions for 'frontend.login-history' module.
 *
 * Note that this file should only contain controllers and nothing else.
 */
(function() {
  'use strict';

  angular.module('frontend.services')
    .controller('ServiceHealthChecksController', [
      '$scope', '$log', '$state','ServiceService','ServiceHCModel','$uibModal','MessageService','SettingsService',
      function controller($scope, $log, $state, ServiceService, ServiceHCModel,$uibModal,MessageService,SettingsService) {


          $scope.toggleServiceHC = function() {

              ServiceHCModel.update($scope.serviceHC.id,{active: $scope.serviceHC.active})
                  .then(function(updated){

                      MessageService.success("Health Checks " + ($scope.serviceHC.active ? 'enabled' : 'disabled') + " ")
                  },function(err){
                      //
                  })
          }

          $scope.save = function() {
              if(!$scope.serviceHC.health_check_endpoint) return false;
              ServiceHCModel.update($scope.serviceHC.id,$scope.serviceHC)
                  .then(function(updated){
                      MessageService.success("Service health checks updated!")
                  },function(err){
                      //
                  })
          }

          function _fetchServiceHC() {
              ServiceHCModel.load({
                  service_id : $scope.service.id,
                  limit : 1
              }).then(function(data){
                        if(!data.length) {
                            ServiceHCModel.create({
                                "service_id" : $scope.service.id,
                                "service" : $scope.service,
                                "health_check_endpoint" : "",
                                "notification_endpoint" : "",
                                "active" : false
                            }).then(function(response){
                                $scope.serviceHC = response.data
                            },function(err){
                                //
                            })
                        }else{
                            $scope.serviceHC = data[0]
                        }
                  })
          }



          $scope.$on('service.health_checks',function(event,data){

              if(!$scope.serviceHC) return false;
              if(data.hc_id == $scope.serviceHC.id) {
                  $scope.serviceHC.data = data
                  $scope.$apply()
              }

          })

          _fetchServiceHC()


      }
    ])
  ;
}());
