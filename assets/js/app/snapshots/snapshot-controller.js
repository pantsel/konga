/**
 * This file contains all necessary Angular controller definitions for 'frontend.admin.login-history' module.
 *
 * Note that this file should only contain controllers and nothing else.
 */
(function() {
    'use strict';

    angular.module('frontend.snapshots')
        .controller('SnapshotController', [
            '_','$scope', '$rootScope','$q','$log','$ngBootbox',
            'SocketHelperService','MessageService','SnapshotsService',
            '$state','$uibModal','DialogService','Snapshot',
            '_snapshot',
            function controller(_,$scope, $rootScope,$q,$log,$ngBootbox,
                                SocketHelperService, MessageService,SnapshotsService,
                                $state, $uibModal,DialogService,Snapshot,
                                _snapshot) {

                $log.debug("Snapshot",_snapshot)

                $scope.snapshot = angular.copy(_snapshot)

                // Hide the orderlist attribute of upstreams for faster rendering
                if($scope.snapshot.data.upstreams) {
                    $scope.snapshot.data.upstreams.forEach(function(item){
                        item.orderlist = '( Not shown for faster DOM rendering... )'
                    })
                }


                $scope.downloadSnapshot = function() {
                    var dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(_snapshot));
                    var dlAnchorElem = document.getElementById('downloadAnchorElem');
                    dlAnchorElem.setAttribute("href",     dataStr     );
                    dlAnchorElem.setAttribute("download", "snpsht_" + _snapshot.name + "@" + _snapshot.kong_node_name + ".json");
                    dlAnchorElem.click();
                }


                $scope.showRestoreModal = function() {

                    var modalInstance = $uibModal.open({
                        animation: true,
                        ariaLabelledBy: 'modal-title',
                        ariaDescribedBy: 'modal-body',
                        templateUrl: 'js/app/snapshots/snapshot-apply-modal.html',
                        controller: function($scope,$uibModalInstance,SnapshotsService,UserService,_snapshot){

                            $scope.user = UserService.user()

                            $scope.ready = false;
                            $scope.imports = []

                            $scope.objects = {}
                            Object.keys(_snapshot.data).forEach(function(item){
                                $scope.objects[item] = {
                                    isChecked : false
                                }
                            })

                            $scope.updateImports = function(){
                                $scope.imports = []
                                Object.keys($scope.objects).forEach(function(key){
                                    if($scope.objects[key].isChecked) {
                                        $scope.imports.push(key)
                                    }
                                })
                            }

                            $scope.close = function(){
                                $uibModalInstance.dismiss()
                            }


                            $scope.selectNode = function() {
                                $uibModal.open({
                                    animation: true,
                                    ariaLabelledBy: 'modal-title',
                                    ariaDescribedBy: 'modal-body',
                                    templateUrl: 'js/app/connections/connections-modal.html',
                                    controller: 'UpdateUserNodeController',
                                    controllerAs: '$ctrl',
                                    resolve: {
                                        _nodes: [
                                            '_',
                                            'ListConfig','SocketHelperService',
                                            'NodeModel',
                                            function resolve(
                                                _,
                                                ListConfig,SocketHelperService,
                                                NodeModel
                                            ) {
                                                return NodeModel.load({
                                                    sort: 'createdAt DESC'
                                                });
                                            }
                                        ]
                                    }
                                });
                            }

                            $scope.restore = function () {
                                $scope.ready = true;
                                $scope.restoring = true
                                SnapshotsService.restoreSnapshot(_snapshot.id, $scope.imports)
                                    .then(function(success){
                                        $scope.results = success.data
                                        $scope.restoring = false;
                                    })
                                    .catch(function(err){
                                        $log.debug("restoreSnapshot:error",err)
                                        $scope.restoring = false;
                                    })
                            }

                            //restore()


                        },
                        resolve : {
                            _snapshot : function() {
                                return $scope.snapshot
                            }
                        }
                    });

                    modalInstance.result.then(function (d) {

                    }, function (result) {

                    });

                }

            }
        ])
    ;
}());