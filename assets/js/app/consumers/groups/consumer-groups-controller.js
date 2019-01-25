/**
 * This file contains all necessary Angular controller definitions for 'frontend.admin.login-history' module.
 *
 * Note that this file should only contain controllers and nothing else.
 */
(function () {
  'use strict';

  angular.module('frontend.consumers')
    .controller('ConsumerGroupsController', [
      '_', '$scope', '$log', '$state', 'ConsumerService','$stateParams', 'ACLModel', 'ListConfig',
      'MessageService', 'DialogService', '$uibModal',
      function controller(_, $scope, $log, $state, ConsumerService,$stateParams, ACLModel, ListConfig,
                          MessageService, DialogService, $uibModal) {

        ACLModel.setScope($scope, false, 'items', 'itemCount');
        $scope = angular.extend($scope, angular.copy(ListConfig.getConfig('consumerACLs',ACLModel)));
        $scope.addGroup = addGroup
        $scope.deleteGroup = deleteConsumerGroup
        
        function addGroup(consumer) {
          $uibModal.open({
            animation: true,
            ariaLabelledBy: 'modal-title',
            ariaDescribedBy: 'modal-body',
            templateUrl: 'js/app/consumers/groups/create-group-modal.html',
            controller: ['$scope', '$log', '$rootScope', '$uibModalInstance', 'ConsumerService', '_consumer',
              function ($scope, $log, $rootScope, $uibModalInstance, ConsumerService, _consumer) {

                $scope.close = close
                $scope.createGroup = createGroup
                $scope.acl = {
                  group: '',
                }

                function createGroup() {
                  ConsumerService.addAcl(_consumer.id, $scope.acl).then(function (data) {
                    fetchData()
                    close()
                  }).catch(function (err) {
                    $log.error(err)
                    $scope.errors = ACLModel.handleError($scope, err);
                  })

                }

                function close() {
                  $uibModalInstance.dismiss()
                }
              }],
            controllerAs: '$ctrl',
            resolve: {
              _consumer: function () {
                return consumer
              }
            }
          });
        }

        function deleteConsumerGroup(group) {
          DialogService.prompt(
            "Delete Group", "Really want to remove the group from the consumer?",
            ['No', 'Remove it!'],
            function accept() {
              ConsumerService.deleteAcl($scope.consumer.id, group.id)
                .then(function (data) {
                  fetchData()
                })

            }, function decline() {
            })

        }

        function fetchData() {
          ConsumerService.fetchAcls($scope.consumer.id)
            .then(function (res) {
              $scope.items = res.data;
              console.log('ACLS =>', $scope.items);
            })
        }

        fetchData();
      }
    ])
}());
