/**
 * This file contains all necessary Angular controller definitions for 'frontend.admin.login-history' module.
 *
 * Note that this file should only contain controllers and nothing else.
 */
(function() {
    'use strict';

    angular.module('frontend.consumers')
        .controller('ImportConsumersConnectionController', [
            '_','$scope', '$log', '$state','RemoteStorageService',
            'MessageService','Upload','BackendConfig','ConsumerModel',
            'ConsumerService','$uibModal','$uibModalInstance',
            '_adapter',
            function controller(_,$scope, $log, $state, RemoteStorageService,
                                MessageService, Upload, BackendConfig,ConsumerModel,
                                ConsumerService, $uibModal, $uibModalInstance,_adapter) {

                $scope.adapter = _adapter
                $scope.closeModal = function() {
                    $uibModalInstance.dismiss()
                }

                $scope.connOptions = {
                    adapter : $scope.adapter.value
                }

                $scope.loadConsumers = function() {
                    $scope.busy = true

                    if($scope.adapter.hasFiles) {

                        Upload.upload({
                            url: BackendConfig.url + '/remote/consumers',
                            arrayKey: '',
                            data: $scope.connOptions
                        }).then(function (resp) {
                            $log.debug("Upload ended",resp)
                            $scope.busy = false
                            onConsumersLoaded(resp.data)
                            $uibModalInstance.dismiss()
                        }, function (err) {
                            $log.debug("Upload error",err)
                            console.log(err)
                            MessageService.error("Could not retrieve consumers from " +
                                "the remote storage. Make sure your connection options " +
                                "are correct. " + err.data)
                            $scope.busy = false
                        }, function (evt) {
                            $log.debug("Upload evt",evt)
                        });

                    }else{
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

                }

                function onConsumersLoaded(consumers) {
                    $uibModal.open({
                        animation: true,
                        ariaLabelledBy: 'modal-title',
                        ariaDescribedBy: 'modal-body',
                        templateUrl: 'js/app/consumers/import/modal-consumers-table.html',
                        controller: 'ImportConsumersTableController',
                        controllerAs: '$ctrl',
                        resolve : {
                            _consumers : function() {
                                return consumers;
                            },
                            //_existingConsumers : function() {
                            //    return ConsumerModel
                            //        .load()
                            //    ;
                            //}
                        }
                    });
                }

            }
        ])
}());
