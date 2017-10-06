/**
 * This file contains all necessary Angular controller definitions for 'frontend.admin.login-history' module.
 *
 * Note that this file should only contain controllers and nothing else.
 */
(function() {
  'use strict';

  angular.module('frontend.consumers')
    .controller('ConsumerGroupsController', [
      '_','$scope', '$log', '$state','ConsumerService',
        'MessageService','DialogService','$uibModal','_acls',
      function controller(_,$scope, $log, $state, ConsumerService,
                          MessageService,DialogService,$uibModal,_acls) {

          $scope.acls = _acls.data.data
          $scope.addGroup = addGroup
          $scope.deleteGroup = deleteConsumerGroup

          function addGroup(consumer) {
              $uibModal.open({
                  animation: true,
                  ariaLabelledBy: 'modal-title',
                  ariaDescribedBy: 'modal-body',
                  templateUrl: 'js/app/consumers/groups/create-group-modal.html',
                  controller: ['$scope','$log','$rootScope','$uibModalInstance','ConsumerService','_consumer',
                      function($scope,$log,$rootScope, $uibModalInstance,ConsumerService,_consumer){

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
                                  $log.error(err)

                                  $scope.errors = err.data.body || err.data.customMessage || {}
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

          function fetcAcls() {
              ConsumerService.fetchAcls($scope.consumer.id)
                  .then(function(res){
                      $scope.acls = res.data.data;
                  })
          }
      }
    ])
}());
