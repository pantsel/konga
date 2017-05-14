/**
 * This file contains all necessary Angular controller definitions for 'frontend.login-history' module.
 *
 * Note that this file should only contain controllers and nothing else.
 */
(function() {
  'use strict';

  angular.module('frontend.apis')
    .controller('ApisController', [
      '$scope','$rootScope', '$log', '$state','ApiService','UserService','$uibModal','DialogService','SettingsService','ApiHCModel',
      function controller($scope,$rootScope, $log, $state, ApiService, UserService,$uibModal,DialogService,SettingsService,ApiHCModel ) {

          $scope.user = UserService.user()
          $scope.settings = SettingsService.getSettings()



          $scope.toggleStripRequestPathOrUri = function(api) {

              if($rootScope.Gateway.version.indexOf("0.9.") > -1){
                  api.strip_request_path=!api.strip_request_path
              }else{
                  api.strip_uri=!api.strip_uri
              }

              $scope.updateApi(api)
          }

          $scope.isRequestPathOrUriStripped = function(api) {
              if($rootScope.Gateway && $rootScope.Gateway.version.indexOf("0.9.") > -1){
                  return api.strip_request_path
              }

              return api.strip_uri
          }

          $scope.$on('api.created',function(){
              getApis()
          })


          $scope.$on('user.node.updated',function(node){
              getApis()
          })

          $scope.deleteApi = function($index,api) {
              DialogService.prompt(
                  "Delete API","Really want to delete the selected API?",
                  ['No don\'t','Yes! delete it'],
                  function accept(){
                      ApiService.delete(api)
                          .then(function(res){
                              $scope.apis.data.splice($scope.apis.data.indexOf(api),1);
                          }).catch(function(err){

                      })
              },function decline(){})

          }

          $scope.openAddApiModal = function() {
              $uibModal.open({
                  animation: true,
                  ariaLabelledBy: 'modal-title',
                  ariaDescribedBy: 'modal-body',
                  templateUrl: 'js/app/apis/add-api-modal.html',
                  controller: 'AddApiModalController',
                  controllerAs: '$ctrl',
                  size: 'lg'
              });
          }



          $scope.updateApi = function(api) {

              $scope.loading = true
              ApiService.update(api)
                  .then(function(res){
                      $log.debug("Update Api: ",res)
                      $scope.loading = false
                      getApis()
                  }).catch(function(err){
                  $log.error("Update Api: ",err)
                  $scope.loading = false
              })

          }


          function getApis(){
              $scope.loading = true;
              ApiService.all()
                  .then(function(res){
                      $scope.apis = res.data
                      assginApisHealthChecks();
                      $scope.loading= false;
                  }).catch(function(err){
                  $scope.loading= false;
              })

          }


          function assginApisHealthChecks() {
              $scope.apis.data.forEach(function(api){
                  if(!api.health_checks){
                      ApiHCModel.load({
                          api_id : api.id,
                          limit : 1
                      }).then(function(data){
                          if(data[0]) api.health_checks = data[0]
                      })
                  }
              })
          }


          getApis();


          $scope.$on('api.health_checks',function(event,data){
              $scope.apis.data.forEach(function(api){
                  if(api.health_checks && data.hc_id == api.health_checks.id) {
                      api.health_checks.data = data
                      $scope.$apply()
                  }
              })
          })

      }
    ])
  ;
}());
