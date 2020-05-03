/**
 * This file contains all necessary Angular controller definitions for 'frontend.admin.login-history' module.
 *
 * Note that this file should only contain controllers and nothing else.
 */
(function() {
    'use strict';

    angular.module('frontend.connections')
        .controller('EditConnectionController', [
            '$scope','$rootScope','$log','NodeModel',
            'MessageService','SettingsService','$uibModalInstance','_node',
            function controller($scope,$rootScope,$log,NodeModel,
                                MessageService,SettingsService,$uibModalInstance,_node) {

                $scope.kong_versions = SettingsService.getKongVersions()

                $scope.node = _node;

                $scope.active = ['default','key_auth','jwt','basic_auth'].indexOf($scope.node.type);

                $scope.close = function(){
                    $uibModalInstance.dismiss();
                }

                $scope.create = function() {
                    $scope.busy = true;
                    NodeModel
                        .update($scope.node.id, angular.copy($scope.node))
                        .then(
                            function onSuccess(result) {
                                MessageService.success('Node updated successfully');
                                $scope.busy = false;
                                $rootScope.$broadcast('kong.node.updated',result.data);
                                $uibModalInstance.dismiss();
                            },function(err){
                                $scope.busy = false
                                NodeModel.handleError($scope,err);
                            }
                        )
                    ;
                };
            }
        ])
    ;
}());