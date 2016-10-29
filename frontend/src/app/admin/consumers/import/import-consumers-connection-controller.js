/**
 * This file contains all necessary Angular controller definitions for 'frontend.admin.login-history' module.
 *
 * Note that this file should only contain controllers and nothing else.
 */
(function() {
    'use strict';

    angular.module('frontend.admin.consumers')
        .controller('ImportConsumersConnectionController', [
            '_','$scope', '$log', '$state','RemoteStorageService','MessageService',
            'ConsumerService','$uibModal','$uibModalInstance',
            '_adapter',
            function controller(_,$scope, $log, $state, RemoteStorageService, MessageService,
                                ConsumerService, $uibModal, $uibModalInstance,_adapter) {

                $scope.adapter = _adapter
                $scope.closeModal = function() {
                    $uibModalInstance.dismiss()
                }

                $scope.connOptions = {}

                $scope.loadConsumers = function() {
                    $scope.busy = true
                    RemoteStorageService
                        .fetchConsumers($scope.connOptions)
                        .then(function(resp){
                            $log.debug("Fetch Consumers", resp)
                            $scope.busy = false;
                            onConsumersLoaded(resp.data)
                            $uibModalInstance.dismiss()
                        }).catch(function(err){
                        $log.error("Fetch Consumers", err)
                        $scope.busy = false;
                        MessageService.error("Could not retrieve consumers from " +
                            "the remote storage. Make sure your connection options " +
                            "are correct.")
                    })
                }

                function onConsumersLoaded(consumers) {
                    $uibModal.open({
                        animation: true,
                        ariaLabelledBy: 'modal-title',
                        ariaDescribedBy: 'modal-body',
                        templateUrl: '/frontend/admin/consumers/import/modal-consumers-table.html',
                        controller: 'ImportConsumersTableController',
                        controllerAs: '$ctrl',
                        resolve : {
                            _consumers : function() {
                                return consumers
                            }
                        }
                    });
                }

            }
        ])
}());
