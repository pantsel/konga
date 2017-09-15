/**
 * This file contains all necessary Angular controller definitions for 'frontend.admin.login-history' module.
 *
 * Note that this file should only contain controllers and nothing else.
 */
(function() {
    'use strict';

    angular.module('frontend.connections')
        .controller('CreateConnectionController', [
            '$scope','$rootScope','$log','NodeModel',
            'MessageService','SettingsService','$uibModalInstance',
            function controller($scope,$rootScope,$log,NodeModel,
                                MessageService,SettingsService,$uibModalInstance) {

                $scope.kong_versions = SettingsService.getKongVersions()

                $scope.node = {
                    kong_admin_url : '',
                    kong_version : '0-11-x',
                }

                $scope.close = function(){
                    $uibModalInstance.dismiss()
                }

                $scope.create = function() {
                    $scope.busy = true;
                    NodeModel
                        .create(angular.copy($scope.node))
                        .then(
                            function onSuccess(result) {
                                $log.info('New node created successfully',result)
                                MessageService.success('New node created successfully');
                                $scope.busy = false;
                                $rootScope.$broadcast('kong.node.created',result.data)
                                $uibModalInstance.dismiss()
                            },function(err){
                                $scope.busy = false
                                NodeModel.handleError($scope,err)
                            }
                        )
                    ;
                }

            }
        ])
    ;
}());