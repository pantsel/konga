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
                    type : 'default',
                    jwt_algorithm : 'HS256', // Initialize this anyway so that it can be preselected
                }

                $scope.close = function(){
                    $uibModalInstance.dismiss();
                }

                $scope.create = function() {
                    $scope.busy = true;
                    console.log("Creating connection", angular.copy($scope.node))
                    NodeModel
                        .create(angular.copy($scope.node))
                        .then(
                            function onSuccess(result) {
                                MessageService.success('New node created successfully');
                                $scope.busy = false;
                                $rootScope.$broadcast('kong.node.created',result.data);
                                $uibModalInstance.dismiss();
                            },function(err){
                                $scope.busy = false
                                console.error(err);
                                NodeModel.handleError($scope,err);
                                MessageService.error(_.get(err, 'data.message', 'Something went wrong...'))
                            }
                        )
                    ;
                };
            }
        ])
    ;
}());
