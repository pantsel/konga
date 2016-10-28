/**
 * This file contains all necessary Angular controller definitions for 'frontend.admin.login-history' module.
 *
 * Note that this file should only contain controllers and nothing else.
 */
(function() {
    'use strict';

    angular.module('frontend.admin.consumers')
        .controller('ImportConsumersConnectionController', [
            '_','$scope', '$log', '$state',
            'ConsumerService','$uibModal','$uibModalInstance','_adapter',
            function controller(_,$scope, $log, $state,
                                ConsumerService, $uibModal, $uibModalInstance,_adapter) {

                $scope.adapter = _adapter

                $scope.connOptions = {

                }

            }
        ])
}());
