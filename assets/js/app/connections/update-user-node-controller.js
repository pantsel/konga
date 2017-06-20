/**
 * This file contains all necessary Angular controller definitions for 'frontend.admin.login-history' module.
 *
 * Note that this file should only contain controllers and nothing else.
 */
(function() {
    'use strict';

    angular.module('frontend.connections')
        .controller('UpdateUserNodeController', ['$scope','$rootScope','$uibModalInstance','UserService',
            '$log','NodeModel','UserModel','InfoService','$localStorage','_nodes',
            function($scope,$rootScope,$uibModalInstance,UserService,
                     $log,NodeModel,UserModel,InfoService,$localStorage,_nodes){

                $scope.connections = _nodes

                $log.debug("connections",$scope.connections)

                $scope.close = function(){
                    $uibModalInstance.dismiss()
                }

                $scope.closeAlert = function(index) {
                    $scope.alerts.splice(index, 1);
                };

                $scope.activateConnection = function(node) {

                    $scope.alerts = [];

                    if(($rootScope.user.node.id == node.id ) || node.checkingConnection) return false;


                    // Check if the connection is valid
                    node.checkingConnection = true;
                    InfoService.nodeStatus({
                        kong_admin_url : node.kong_admin_url
                    }).then(function(response){
                        $log.debug("Check connection:success",response)
                        node.checkingConnection = false;

                        UserModel
                            .update(UserService.user().id, {
                                node : node
                            })
                            .then(
                                function onSuccess(res) {
                                    var credentials = $localStorage.credentials
                                    credentials.user.node = node
                                    $rootScope.$broadcast('user.node.updated',node)
                                    $scope.close()
                                },function(err){
                                    $scope.busy = false
                                    UserModel.handleError($scope,err)
                                }
                            );

                    }).catch(function(error){
                        $log.debug("Check connection:error",error)
                        node.checkingConnection = false;
                        $scope.alerts.push({ type: 'danger', msg: 'Oh snap! Cannot connect to the selected node.' })
                    })

                }
            }])
    ;
}());