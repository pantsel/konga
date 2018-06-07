/**
 * This file contains all necessary Angular controller definitions for 'frontend.admin.login-history' module.
 *
 * Note that this file should only contain controllers and nothing else.
 */
(function() {
    'use strict';

    angular.module('frontend.consumers')
        .controller('ImportConsumersStorageController', [
            '_','$scope', '$log', '$state',
            'ConsumerService','RemoteStorageService',
            '$uibModal','$uibModalInstance','_adapters','_existingConsumers',
            function controller(_,$scope, $log, $state,
                                ConsumerService, RemoteStorageService,
                                $uibModal, $uibModalInstance,_adapters, _existingConsumers) {

                $scope.adapters = _adapters.data
                console.log("@@@@@@@@@@@@@@@@", _existingConsumers);

                $scope.close = function() {
                    $uibModalInstance.dismiss()
                }

                $scope.onStorageSelected = function(adapter) {
                    $uibModalInstance.dismiss()
                    $uibModal.open({
                        animation: true,
                        ariaLabelledBy: 'modal-title',
                        ariaDescribedBy: 'modal-body',
                        templateUrl: 'js/app/consumers/import/modal-connection-options.html',
                        controller: 'ImportConsumersConnectionController',
                        controllerAs: '$ctrl',
                        resolve : {
                            _adapter : function() {
                                return $scope.adapters[adapter]
                            },
                            _existingConsumers : function () {
                                return _existingConsumers;
                            }
                        }
                    });

                }

            }
        ])
}());
