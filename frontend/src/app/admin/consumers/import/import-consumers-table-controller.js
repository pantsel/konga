/**
 * This file contains all necessary Angular controller definitions for 'frontend.admin.login-history' module.
 *
 * Note that this file should only contain controllers and nothing else.
 */
(function() {
    'use strict';

    angular.module('frontend.admin.consumers')
        .controller('ImportConsumersTableController', [
            '_','$scope', '$log', '$state','ConsumerService','$uibModal','$uibModalInstance','_consumers',
            function controller(_,$scope, $log, $state, ConsumerService, $uibModal, $uibModalInstance,_consumers) {

                $scope.consumers = _consumers;

                $scope.closeModal = function() {
                    $uibModalInstance.dismiss()
                }

                $scope.importChecked = function() {
                    var _consumers = $scope.consumers.map(function(consumer){
                        return consumer.checked ? consumer : undefined
                    }).filter(function(n){ return n != undefined })

                    doImport(_consumers)
                }


                $scope.importAll = function() {
                    doImport($scope.consumers)
                }


                function doImport(consumers) {

                    $uibModalInstance.dismiss()

                    $uibModal.open({
                        animation: true,
                        backdrop  : 'static',
                        keyboard  : false,
                        ariaLabelledBy: 'modal-title',
                        ariaDescribedBy: 'modal-body',
                        templateUrl: '/frontend/admin/consumers/import/modal-import.html',
                        controller: 'ImportConsumersController',
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
