/**
 * This file contains all necessary Angular controller definitions for 'frontend.admin.login-history' module.
 *
 * Note that this file should only contain controllers and nothing else.
 */
(function() {
    'use strict';

    angular.module('frontend.settings')
        .controller('SnapshotsController', [
            '_','$scope', '$rootScope','$q','$log','$ngBootbox','UserModel',
            'SocketHelperService','UserService','SettingsService','MessageService',
            '$state','$uibModal','DialogService','Snapshot','$localStorage',
            'ListConfig',
            function controller(_,$scope, $rootScope,$q,$log,$ngBootbox,UserModel,
                                SocketHelperService, UserService,SettingsService, MessageService,
                                $state, $uibModal,DialogService,Snapshot,$localStorage,
                                ListConfig) {


                Snapshot.setScope($scope, false, 'items', 'itemCount');

                // Add default list configuration variable to current scope
                $scope = angular.extend($scope, angular.copy(ListConfig.getConfig()));

                // Set initial data
                $scope.user = UserService.user();

                // Initialize used title items
                $scope.titleItems = ListConfig.getTitleItems(Snapshot.endpoint);



                // Initialize default sort data

                $scope.paging = {
                    currentPage: 1,
                };

                $scope.sort = {
                    column: 'createdAt',
                    direction: false,
                };

                // Initialize filters
                $scope.filters = {
                    searchWord: '',
                    columns: $scope.nodeTitleItems,
                };

                // Function to change sort column / direction on list
                $scope.changeSort = function changeSort(item) {
                    var sort = $scope.sort;

                    if (sort.column === item.column) {
                        sort.direction = !sort.direction;
                    } else {
                        sort.column = item.column;
                        sort.direction = true;
                    }

                    _triggerFetchData();
                };


                $scope.pageChanged = function() {
                    $log.log('Page changed to: ' + $scope.paging.currentPage);
                    _fetchData();
                }

                /**
                 * Simple watcher for 'itemsPerPage' scope variable. If this is changed we need to fetch author data
                 * from server.
                 */
                $scope.$watch('itemsPerPage', function watcher(valueNew, valueOld) {
                    if (valueNew !== valueOld) {
                        _triggerFetchData();
                    }
                });


                $scope.$watch('filters', function watcher(valueNew, valueOld) {
                    if (valueNew !== valueOld) {
                        _triggerFetchData();
                    }
                },true);

                $scope.takeSnapshot = function(){
                    $ngBootbox.prompt('Enter a unique name')
                        .then(function(name) {

                            if(!name) {
                                MessageService.error('You need to provide a unique name for the snapshot');
                            }

                            SettingsService.takeSnapshot(name)
                                .then(function(success){
                                    MessageService.success('Snapshot created!');
                                    _triggerFetchData()
                                }).catch(function(err){

                            })

                        }, function() {
                            console.log('Prompt dismissed!');
                        });
                }


                // User delete dialog buttons configuration
                $scope.confirmButtonsDelete = {
                    ok: {
                        label: 'Delete',
                        className: 'btn-danger btn-link',
                        callback: function callback(result,node) {
                            console.log(node)
                            //$scope.deleteNode();
                        }
                    },
                    cancel: {
                        label: 'Cancel',
                        className: 'btn-default btn-link'
                    }
                };


                $scope.deleteSnapshot = function deleteSnapshot(snapshot) {

                    Snapshot
                        .delete(snapshot.id)
                        .then(
                            function onSuccess(data) {
                                MessageService.success('Snapshot deleted successfully');
                                _triggerFetchData()
                            }
                        )
                    ;
                };



                function _triggerFetchData() {
                    if ($scope.paging.currentPage === 1) {
                        _fetchData();
                    } else {
                        $scope.paging.currentPage = 1;
                    }
                }


                /**
                 * Helper function to fetch actual data for GUI from backend server with current parameters:
                 *  1) Current page
                 *  2) Search word
                 *  3) Sort order
                 *  4) Items per page
                 *
                 * Actually this function is doing two request to backend:
                 *  1) Data count by given filter parameters
                 *  2) Actual data fetch for current page with filter parameters
                 *
                 * These are fetched via 'AuthorModel' service with promises.
                 *
                 * @private
                 */
                function _fetchData() {
                    $scope.loading = true;

                    // Common parameters for count and data query
                    var commonParameters = {
                        where: SocketHelperService.getWhere($scope.filters)
                    };

                    // Data query specified parameters
                    var parameters = {
                        limit: $scope.itemsPerPage,
                        skip: ($scope.paging.currentPage - 1) * $scope.itemsPerPage,
                        sort: $scope.sort.column + ' ' + ($scope.sort.direction ? 'ASC' : 'DESC')
                    };

                    // Fetch data count
                    var count = Snapshot
                        .count(commonParameters)
                        .then(
                            function onSuccess(response) {
                                $scope.itemCount = response.count;
                            }
                        );


                    // Fetch actual data
                    var load = Snapshot
                        .load(_.merge({}, commonParameters, parameters))
                        .then(
                            function onSuccess(response) {
                                $scope.snapshots = response;
                                $log.debug("Snapshots",$scope.snapshots)
                            }
                        )
                        ;

                    // And wrap those all to promise loading
                    $q
                        .all([count, load])
                        .finally(
                            function onFinally() {
                                $scope.loaded = true;
                                $scope.loading = false;
                            }
                        )
                    ;
                }



                _triggerFetchData();
            }
        ])
    ;
}());