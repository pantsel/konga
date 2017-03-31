/**
 * This file contains all necessary Angular controller definitions for 'frontend.login-history' module.
 *
 * Note that this file should only contain controllers and nothing else.
 */
(function() {
  'use strict';

  angular.module('frontend.apis')
    .controller('ApisController', [
      '$scope','$rootScope', '$log', '$state','ApiService','$uibModal','DialogService','SettingsService','_apis',
      function controller($scope,$rootScope, $log, $state, ApiService, $uibModal,DialogService,SettingsService,_apis ) {

          $scope.apis = _apis.data
          $scope.settings = SettingsService.getSettings()

          function getApis(){
              $scope.loading = true;
              ApiService.all()
                  .then(function(res){
                      $scope.apis = res.data
                      $scope.loading= false;
                  }).catch(function(err){
                  $scope.loading= false;
              })

          }

          $scope.toggleStripRequestPathOrUri = function(api) {

              if($rootScope.$node.kong_version == '0-9-x'){
                  api.strip_request_path=!api.strip_request_path
              }else{
                  api.strip_uri=!api.strip_uri
              }

              $scope.updateApi(api)
          }

          $scope.isRequestPathOrUriStripped = function(api) {
              if($scope.settings.kong_version == '0-9-x'){
                  return api.strip_request_path
              }

              return api.strip_uri
          }

          $scope.$on('api.created',function(){
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

          $scope.openAddApiModal = function(api) {
              $uibModal.open({
                  animation: true,
                  ariaLabelledBy: 'modal-title',
                  ariaDescribedBy: 'modal-body',
                  templateUrl: 'js/app/apis/add-api-modal.html',
                  controller: 'AddApiModalController',
                  controllerAs: '$ctrl',
                  size: 'lg',
                  resolve: {
                      api: function () {
                          return api;
                      }
                  }
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

      }
    ])
  ;
}());
