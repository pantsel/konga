/**
 * This file contains all necessary Angular controller definitions for 'frontend.examples.author' module.
 *
 * Note that this file should only contain controllers and nothing else.
 */
(function() {
  'use strict';

  // Controller for new author creation.
  angular.module('frontend.consumers.groups')
    .controller('ManageKongGroupController', [
      '$scope', '$rootScope', '$log','$state','$uibModal','KongGroupModel','DialogService',
      'MessageService','$uibModalInstance','_groups',
      function controller(
        $scope, $rootScope, $log, $state, $uibModal, KongGroupModel, DialogService,
        MessageService,$uibModalInstance, _groups
      ) {

          $scope.close = close
          $scope.openCreateGroupModal = openCreateGroupModal
          $scope.deleteGroup = deleteGroup
          $scope.updateGroup = updateGroup
          $scope.groups = _groups
          $scope.search = {
              value : ''
          }

          function openCreateGroupModal() {
              var modalInstance = $uibModal.open({
                  animation: true,
                  ariaLabelledBy: 'modal-title',
                  ariaDescribedBy: 'modal-body',
                  templateUrl: 'js/app/consumers/groups/create-group-modal.html',
                  controller: ['$scope','$rootScope','$uibModalInstance','KongGroupModel',
                      function($scope,$rootScope, $uibModalInstance,KongGroupModel){

                          $scope.close = close
                          $scope.createGroup = createGroup
                          $scope.group = {
                              name : '',
                          }



                          function createGroup() {
                              KongGroupModel
                                  .create(angular.copy($scope.group))
                                  .then(
                                      function onSuccess(result) {
                                          if(result.data && result.data.error){
                                              $scope.errors = {}
                                              for(var key in result.data.invalidAttributes){
                                                  $scope.errors[key] = result.data.invalidAttributes[key][0].message
                                              }
                                          }else{
                                              MessageService.success('New group created successfully');
                                              $rootScope.$broadcast('kong.group.created',result)
                                              close()
                                          }

                                      },
                                      function onError(err) {

                                          $log.error(err);
                                          $scope.errors = err.data.body || err.data.customMessage || {}
                                      }
                                  )
                          }

                          function close() {
                              $uibModalInstance.dismiss()
                          }
                  }],
                  controllerAs: '$ctrl',
              });

              modalInstance.result.then(function (selectedItem) {

              }, function () {

              });
          }

          function updateGroup(group) {
              KongGroupModel
                  .update(group.id,group)
                  .then(
                      function onSuccess(result) {
                          MessageService.success('Group updated successfully');
                          $rootScope.$broadcast('kong.group.updated',result)
                          fetchGroups()
                      }, function(err) {
                          $scope.errors = err.data.body || err.data.customMessage || {}
                      }
                  )
          }

          function deleteGroup(group) {

              DialogService.confirm(
                  "Delete Group","Really want to delete the '" + group.name + "' group?",
                  ['No don\'t','Yes! delete it'],
                  function accept(){
                      KongGroupModel
                          .delete(group.id)
                          .then(
                              function onSuccess(result) {
                                  MessageService.success('Group deleted successfully');
                                  $rootScope.$broadcast('kong.group.deleted',result)
                                  fetchGroups()
                              }
                          )
                  },function decline(){})

          }

          function close() {
              $uibModalInstance.dismiss()
          }

          function fetchGroups() {
              KongGroupModel.load()
                  .then(function(data){
                      $scope.groups = data
                  })
          }

          // Listeners
          $scope.$on('kong.group.created',function(ev,group){
              fetchGroups();
          })
      }
    ])
  ;

}());
