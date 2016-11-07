/**
 * This file contains all necessary Angular controller definitions for 'frontend.admin.login-history' module.
 *
 * Note that this file should only contain controllers and nothing else.
 */
(function() {
    'use strict';

    angular.module('frontend.consumers')
        .controller('ImportConsumersTableController', [
            '_','$scope', '$log', '$state','ConsumerService','MessageService',
            '$uibModal','$uibModalInstance','_consumers','_existingConsumers',
            function controller(_,$scope, $log, $state, ConsumerService, MessageService,
                                $uibModal, $uibModalInstance,_consumers,_existingConsumers) {

                $scope.consumers = _consumers;
                $scope.existingConsumers = _existingConsumers
                $log.debug("existingConsumers",_existingConsumers)

                $scope.consumers.forEach(function(consumer){
                    for(var i=0;i<_existingConsumers.length;i++) {
                        if(consumer.username === _existingConsumers[i].username){
                            consumer.exists = true
                            return;
                        }
                    }
                })

                $scope.closeModal = function() {
                    $uibModalInstance.dismiss()
                }

                $scope.importChecked = function() {
                    var _consumers = $scope.consumers.map(function(consumer){
                        return consumer.checked ? consumer : undefined
                    }).filter(function(n){ return n != undefined })

                    if(!_consumers.length){
                        MessageService.error("You have not selected any consumers to import")
                        return false
                    }

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
                        templateUrl: '/frontend/consumers/import/modal-import.html',
                        controller: 'ImportConsumersController',
                        controllerAs: '$ctrl',
                        resolve : {
                            _consumers : function() {
                                return _.remove(consumers, function (consumer) {
                                    return !consumer.exists
                                });
                            }
                        }
                    });
                }

            }
        ])
}());
