/**
 * This file contains all necessary Angular controller definitions for 'frontend.admin.login-history' module.
 *
 * Note that this file should only contain controllers and nothing else.
 */
(function() {
  'use strict';

  angular.module('frontend.admin.consumers')
    .controller('EditConsumerController', [
      '_','$scope', '$log', '$state','ConsumerService',
        'MessageService','$uibModal','DialogService',
        '_consumer','_acls','_keys','_jwts','_basic_auth_credentials','_hmac_auth_credentials',
      function controller(_,$scope, $log, $state,
                          ConsumerService, MessageService,$uibModal,
                          DialogService,_consumer,
                          _acls, _keys, _jwts, _basic_auth_credentials, _hmac_auth_credentials ) {

          $state.current.data.pageName = "Edit Consumer <small>( " + (_consumer.data.username || _consumer.data.custom_id) + " )</small>"
          $scope.consumer = _consumer.data
          $scope.acls = _acls.data.data
          $scope.keys = _keys.data
          $scope.jwts = _jwts.data
          $scope.basic_auth_credentials = _basic_auth_credentials.data
          $scope.hmac_auth_credentials = _hmac_auth_credentials.data

          $log.debug("Keys",$scope.keys)
          $log.debug("Groups",$scope.acls)
          $log.debug("JWTs",$scope.jwts)
          $log.debug("basic_auth_credentials",$scope.basic_auth_credentials)
          $log.debug("hmac_auth_credentials",$scope.hmac_auth_credentials)

          $scope.addGroup = addGroup
          $scope.deleteGroup = deleteConsumerGroup
          $scope.updateConsumerDetails = updateConsumerDetails
          $scope.createApiKey = createApiKey
          $scope.createJWT = createJWT
          $scope.createBasicAuthCredentials = createBasicAuthCredentials
          $scope.createHMAC = createHMAC
          $scope.deleteKey = deleteKey
          $scope.deleteJWT = deleteJWT
          $scope.deleteBasicAuthCredentials = deleteBasicAuthCredentials
          $scope.deleteHMACAuthCredentials = deleteHMACAuthCredentials
          $scope.toggleGroup = toggleGroup
          $scope.sections = [
              {
                  name : 'Details',
                  icon : '&#xE88F;',
                  partial : '/admin/consumers/partials/consumer-details.html',
                  active: true
              },
              {
                  name : 'ACL Groups',
                  icon : '&#xE7FC',
                  partial : '/admin/consumers/partials/consumer-groups.html',
                  active: false
              },
              {
                  name : 'Credentials',
                  icon : '&#xE899;',
                  partial : '/admin/consumers/partials/consumer-credentials.html',
                  active: false
              },
          ]

          $scope.selectSection = function(index) {
              $scope.sections.forEach(function(section,i){
                  if(i === index) {
                      section.active = true
                  }else{
                      section.active = false
                  }
              })
          }

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
                  templateUrl: '/frontend/admin/consumers/credentials/create-api-key-modal.html',
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
                  templateUrl: '/frontend/admin/consumers/credentials/create-basic-auth-modal.html',
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
                  templateUrl: '/frontend/admin/consumers/credentials/create-hmac-auth-modal.html',
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
                  templateUrl: '/frontend/admin/consumers/credentials/create-jwt-modal.html',
                  controller: 'CreateJWTController',
                  controllerAs: '$ctrl',
                  resolve : {
                      _consumer : function() {
                          return $scope.consumer
                      }
                  }
              });
          }

          function addGroup(consumer) {
              $uibModal.open({
                  animation: true,
                  ariaLabelledBy: 'modal-title',
                  ariaDescribedBy: 'modal-body',
                  templateUrl: '/frontend/admin/consumers/groups/create-group-modal.html',
                  controller: ['$scope','$rootScope','$uibModalInstance','ConsumerService','_consumer',
                      function($scope,$rootScope, $uibModalInstance,ConsumerService,_consumer){

                          $scope.close = close
                          $scope.createGroup = createGroup
                          $scope.acl = {
                              group : '',
                          }

                          function createGroup() {
                              ConsumerService.addAcl(_consumer.id,$scope.acl).then(function(data){
                                  fetcAcls()
                                  close()
                              }).catch(function(err){
                                  console.error(err)
                                  $scope.errors = {
                                      group : err.data.customMessage.group
                                  }
                              })

                          }

                          function close() {
                              $uibModalInstance.dismiss()
                          }
                      }],
                  controllerAs: '$ctrl',
                  resolve : {
                      _consumer : function() {
                          return consumer
                      }
                  }
              });
          }


          function toggleGroup(group) {
              if(group.added) {
                  deleteConsumerGroup(group)
              }else{
                  addConsumerGroup(group)
              }
          }

          function deleteConsumerGroup(group) {
              DialogService.prompt(
                  "Delete Group","Really want to remove the group from the consumer?",
                  ['No','Remove it!'],
                  function accept(){
                      ConsumerService.deleteAcl($scope.consumer.id,group.id)
                          .then(function(data){
                              fetcAcls()
                          })

                  },function decline(){})

          }

          function addConsumerGroup(group) {
              ConsumerService.addAcl($scope.consumer.id,{
                  group : group.name
              }).then(function(data){
                      fetcAcls()
              }).catch(function(err){
                  console.error(err)
              })
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


          function fetcAcls() {
              ConsumerService.fetchAcls($scope.consumer.id)
                  .then(function(res){
                      console.log("asdddddddddddd",res.data)
                      $scope.acls = res.data.data;
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


          $scope.$on('kong.group.created',function(ev,group){
              fetcAcls()
          })

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
