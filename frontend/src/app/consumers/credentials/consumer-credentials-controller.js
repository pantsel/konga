/**
 * This file contains all necessary Angular controller definitions for 'frontend.admin.login-history' module.
 *
 * Note that this file should only contain controllers and nothing else.
 */
(function() {
  'use strict';

  angular.module('frontend.consumers')
    .controller('ConsumerCredentialsController', [
      '_','$scope', '$log', '$state',
        'ConsumerService','MessageService','$uibModal',
        'DialogService',
        '_keys','_jwts','_basic_auth_credentials','_hmac_auth_credentials',
      function controller(_,$scope, $log, $state,
                          ConsumerService, MessageService,$uibModal,
                          DialogService,
                          _keys, _jwts, _basic_auth_credentials, _hmac_auth_credentials ) {


          $scope.keys = _keys.data
          $scope.jwts = _jwts.data
          $scope.basic_auth_credentials = _basic_auth_credentials.data
          $scope.hmac_auth_credentials = _hmac_auth_credentials.data


          $scope.updateConsumerDetails = updateConsumerDetails
          $scope.createApiKey = createApiKey
          $scope.createJWT = createJWT
          $scope.createBasicAuthCredentials = createBasicAuthCredentials
          $scope.createHMAC = createHMAC
          $scope.deleteKey = deleteKey
          $scope.deleteJWT = deleteJWT
          $scope.deleteBasicAuthCredentials = deleteBasicAuthCredentials
          $scope.deleteHMACAuthCredentials = deleteHMACAuthCredentials


          function deleteHMACAuthCredentials($index,credentials) {
              DialogService.prompt(
                  "Delete Credentials","Really want to delete the selected credentials?",
                  ['No don\'t','Yes! delete it'],
                  function accept(){
                      ConsumerService
                          .deleteHMACAuthCredentials($scope.consumer.id,credentials.id)
                          .then(
                              function onSuccess(result) {
                                  MessageService.success('Credentials deleted successfully');
                                  fetchHMACAuthCredentials()
                              }
                          )

                  },function decline(){})
          }

          function deleteBasicAuthCredentials($index,credentials) {
              DialogService.prompt(
                  "Delete Credentials","Really want to delete the selected credentials?",
                  ['No don\'t','Yes! delete it'],
                  function accept(){
                      ConsumerService
                          .deleteBasicAuthCredentials($scope.consumer.id,credentials.id)
                          .then(
                              function onSuccess(result) {
                                  MessageService.success('Credentials deleted successfully');
                                  fetchBasicAuthCredentials()
                              }
                          )

                  },function decline(){})
          }

          function deleteJWT($index,jwt) {
              DialogService.prompt(
                  "Delete JWT","Really want to delete the selected JWT?",
                  ['No don\'t','Yes! delete it'],
                  function accept(){
                      ConsumerService
                          .deleteJWT($scope.consumer.id,jwt.id)
                          .then(
                              function onSuccess(result) {
                                  MessageService.success('JWT deleted successfully');
                                  fetchJWTs()
                              }
                          )

                  },function decline(){})
          }

          function deleteKey($index,key) {
              DialogService.prompt(
                  "Delete Key","Really want to delete the selected key?",
                  ['No don\'t','Yes! delete it'],
                  function accept(){
                      ConsumerService
                          .deleteKey($scope.consumer.id,key.id)
                          .then(
                              function onSuccess(result) {
                                  MessageService.success('Key deleted successfully');
                                  fetchKeys()
                              }
                          )

                  },function decline(){})
          }

          function createApiKey() {
              $uibModal.open({
                  animation: true,
                  ariaLabelledBy: 'modal-title',
                  ariaDescribedBy: 'modal-body',
                  templateUrl: '/frontend/consumers/credentials/create-api-key-modal.html',
                  controller: 'CreateKeyAuthController',
                  controllerAs: '$ctrl',
                  resolve : {
                      _consumer : function() {
                          return $scope.consumer
                      }
                  }
              });
          }


          function createBasicAuthCredentials() {
              $uibModal.open({
                  animation: true,
                  ariaLabelledBy: 'modal-title',
                  ariaDescribedBy: 'modal-body',
                  templateUrl: '/frontend/consumers/credentials/create-basic-auth-modal.html',
                  controller: 'CreateBasicAuthController',
                  controllerAs: '$ctrl',
                  resolve : {
                      _consumer : function() {
                          return $scope.consumer
                      }
                  }
              });
          }


          function createHMAC() {
              $uibModal.open({
                  animation: true,
                  ariaLabelledBy: 'modal-title',
                  ariaDescribedBy: 'modal-body',
                  templateUrl: '/frontend/consumers/credentials/create-hmac-auth-modal.html',
                  controller: 'CreateHMACAuthController',
                  controllerAs: '$ctrl',
                  resolve : {
                      _consumer : function() {
                          return $scope.consumer
                      }
                  }
              });
          }

          function createJWT() {
              $uibModal.open({
                  animation: true,
                  ariaLabelledBy: 'modal-title',
                  ariaDescribedBy: 'modal-body',
                  templateUrl: '/frontend/consumers/credentials/create-jwt-modal.html',
                  controller: 'CreateJWTController',
                  controllerAs: '$ctrl',
                  resolve : {
                      _consumer : function() {
                          return $scope.consumer
                      }
                  }
              });
          }



          function updateConsumerDetails() {
              ConsumerService.update($scope.consumer.id,{
                      username : $scope.consumer.username,
                      custom_id : $scope.consumer.custom_id
                  })
                  .then(function(res){
                      $log.debug(res.data)
                      $scope.consumer = res.data
                      MessageService.success("Consumer updated successfully!")
                  }).catch(function(err){
                  $log.error("Failed to update consumer", err)
                  $scope.errors = err.data.customMessage || {}
              })
          }


          function fetchBasicAuthCredentials() {
              ConsumerService.fetchBasicAuthCredentials($scope.consumer.id)
                  .then(function(res){
                      $scope.basic_auth_credentials = res.data;
                  })
          }


          function fetchHMACAuthCredentials() {
              ConsumerService.fetchHMACAuthCredentials($scope.consumer.id)
                  .then(function(res){
                      $scope.hmac_auth_credentials = res.data;
                  })
          }

          function fetchKeys() {
              ConsumerService.fetchKeys($scope.consumer.id)
                  .then(function(res){
                      $scope.keys = res.data
                  })

          }

          function fetchJWTs() {
              ConsumerService.fetchJWTs($scope.consumer.id)
                  .then(function(res){
                      $scope.jwts = res.data
                  })

          }


          /**
           * ----------------------------------------------------------
           * Listeners
           * ----------------------------------------------------------
           */


          $scope.$on('consumer.key.created',function(ev,group){
              fetchKeys()
          })

          $scope.$on('consumer.jwt.created',function(ev,group){
              fetchJWTs()
          })

          $scope.$on('consumer.basic-auth.created',function(ev,group){
              fetchBasicAuthCredentials()
          })


          $scope.$on('consumer.hmac-auth.created',function(ev,group){
              fetchHMACAuthCredentials()
          })

      }
    ])
}());
