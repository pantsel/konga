/**
 * This file contains all necessary Angular controller definitions for 'frontend.login-history' module.
 *
 * Note that this file should only contain controllers and nothing else.
 */
(function() {
  'use strict';

  angular.module('frontend.apis')
    .controller('ApisController', [
      '$scope', '$log', '$state','ApiService','$uibModal','DialogService','_apis',
      function controller($scope, $log, $state, ApiService, $uibModal,DialogService,_apis ) {

          $scope.apis = _apis.data

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
                  templateUrl: '/frontend/apis/add-api-modal.html',
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
