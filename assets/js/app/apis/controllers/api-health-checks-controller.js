/**
 * This file contains all necessary Angular controller definitions for 'frontend.login-history' module.
 *
 * Note that this file should only contain controllers and nothing else.
 */
(function() {
  'use strict';

  angular.module('frontend.apis')
    .controller('ApiHealthChecksController', [
      '$scope', '$log', '$state','ApiService','ApiHCModel','$uibModal','MessageService','SettingsService',
      function controller($scope, $log, $state, ApiService, ApiHCModel,$uibModal,MessageService,SettingsService) {


          $scope.toggleApiHC = function() {

              ApiHCModel.update($scope.apiHC.id,{active: $scope.apiHC.active})
                  .then(function(updated){

                      MessageService.success("Health Checks " + ($scope.apiHC.active ? 'enabled' : 'disabled') + " ")
                  },function(err){
                      //
                  })
          }

          $scope.save = function() {
              if(!$scope.apiHC.health_check_endpoint) return false;
              ApiHCModel.update($scope.apiHC.id,$scope.apiHC)
                  .then(function(updated){
                      MessageService.success("API health checks updated!")
                  },function(err){
                      //
                  })
          }

          function _fetchApiHC() {
              ApiHCModel.load({
                  api_id : $scope.api.id,
                  limit : 1
              }).then(function(data){
                        if(!data.length) {
                            ApiHCModel.create({
                                "api_id" : $scope.api.id,
                                "api" : $scope.api,
                                "health_check_endpoint" : "",
                                "notification_endpoint" : "",
                                "active" : false
                            }).then(function(response){
                                $scope.apiHC = response.data
                            },function(err){
                                //
                            })
                        }else{
                            $scope.apiHC = data[0]
                        }
                  })
          }



          $scope.$on('api.health_checks',function(event,data){

              if(!$scope.apiHC) return false;
              if(data.hc_id == $scope.apiHC.id) {
                  $scope.apiHC.data = data
                  $scope.$apply()
              }

          })

          _fetchApiHC()


      }
    ])
  ;
}());
