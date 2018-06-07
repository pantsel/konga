/**
 * This file contains all necessary Angular controller definitions for 'frontend.admin.login-history' module.
 *
 * Note that this file should only contain controllers and nothing else.
 */
(function() {
    'use strict';

    angular.module('frontend.snapshots')
        .controller('SnapshotsScheduledController', [
            '_','$scope', '$rootScope','$q','$log','$ngBootbox','UserModel',
            'SocketHelperService','UserService','SettingsService','MessageService',
            '$state','$uibModal','DialogService','SnapshotSchedule','$localStorage',
            'ListConfig',
            function controller(_,$scope, $rootScope,$q,$log,$ngBootbox,UserModel,
                                SocketHelperService, UserService,SettingsService, MessageService,
                                $state, $uibModal,DialogService,SnapshotSchedule,$localStorage,
                                ListConfig) {



                SnapshotSchedule.setScope($scope, false, 'items', 'itemCount');

                $scope = angular.extend($scope, angular.copy(ListConfig.getConfig('snapshotschedule',SnapshotSchedule)));

                // Set initial data
                $scope.user = UserService.user();

                // Initialize used title items
                $scope.titleItems = ListConfig.getTitleItems('snapshotschedule');


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
                    columns: $scope.titleItems,
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
                 * Simple watcher for 'itemsPerPage' scope variable. If this is changed we need to fetch data
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
                        sort: $scope.sort.column + ' ' + ($scope.sort.direction ? 'ASC' : 'DESC'),
                        populate : ['connection']
                    };

                    // Fetch data count
                    var count = SnapshotSchedule
                        .count(commonParameters)
                        .then(
                            function onSuccess(response) {
                                $scope.itemCount = response.count;
                            }
                        );


                    // Fetch actual data
                    var load = SnapshotSchedule
                        .load(_.merge({}, commonParameters, parameters))
                        .then(
                            function onSuccess(response) {
                                $log.info("Items",response);
                                $scope.items = response;

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


                $scope.schedule = function(){

                    var modalInstance = $uibModal.open({
                        animation: true,
                        ariaLabelledBy: 'modal-title',
                        ariaDescribedBy: 'modal-body',
                        templateUrl: 'js/app/snapshots/views/snapshots-schedule-modal.html',
                        // size : 'sm',
                        backdrop: 'static',
                        keyboard: false,
                        controller: function(_,$scope,$rootScope,$log,$uibModalInstance, NodeModel, SnapshotSchedule) {

                            $scope.data = {
                                cron : {
                                    minute     : '*',
                                    hour       : '*',
                                    dayOfMonth : '*',
                                    month      : '*',
                                    dayOfWeek  : '*',
                                },
                                connection : null,
                                active : true
                            }

                            $scope.cronString = "";

                            $scope.onCronValueChanged = function() {
                                updateCronString();
                            }


                            $scope.prettyCron = function(cron) {
                                return $rootScope.prettyCron.toString(cron);
                            }


                            $scope.alerts = [];


                            $scope.connections = [];

                            $scope.close = function(){
                                $uibModalInstance.dismiss();
                            };

                            $scope.closeAlert = function(index) {
                                $scope.alerts.splice(index, 1);
                            };


                            $scope.submit = function () {

                                $scope.errorMessage = "";


                                if(!$scope.data.connection) {
                                    $scope.alerts.push({ type: 'danger', msg: 'You need to select a connection.' });
                                    return false;
                                }



                                // Fill in defaults
                                var cron = []
                                Object.keys($scope.data.cron).forEach(function (key) {

                                    cron.push($scope.data.cron[key] || '*');
                                });

                                var data = {
                                    cron : cron.join(" "),
                                    connection : $scope.data.connection,
                                    active : $scope.data.active
                                };


                                SnapshotSchedule.create(data)
                                    .then(function(created){
                                        console.log("SNAPSHOT SCHEDULE CREATED", created);
                                        $uibModalInstance.close(created);
                                }).catch(function(err){
                                    console.log("FAILED TO CREATE SNAPSHOT SCHEDULE", err);
                                    if(err.data && err.data.message) {
                                        $scope.alerts.push({ type: 'danger', msg: err.data.message });
                                    }
                                });


                            }


                            function updateCronString() {
                                var cron = []
                                Object.keys($scope.data.cron).forEach(function (key) {

                                    cron.push($scope.data.cron[key] || '*');
                                });

                                $scope.cronString = cron.join(" ");
                            }


                            function fetchData() {
                                NodeModel.fetch().then(function (connections) {
                                    $scope.connections = connections;
                                }).catch(function (err) {

                                });
                            }


                            updateCronString();
                            fetchData();


                        }
                    });


                    modalInstance.result.then(function close(data) {
                        if(data){
                            _triggerFetchData();
                        }
                    }, function dismiss(data) {

                    });

                };

                $scope.toggleActive = function (item) {

                    var data = _.cloneDeep(item);


                    SnapshotSchedule.update(data.id,{
                        active : !data.active
                    }).then(function (updated) {
                        item.active = updated.data.active;

                        MessageService.success("Scheduled job " + ( item.active ? "started" : "stopped"));

                    }).catch(function (err) {
                       console.error("Failed to update Schedule", err);
                       MessageService.error("Something went wrong...","Could not update schedule");
                    });
                }


                $scope.prettyCron = function(cron) {
                    return $rootScope.prettyCron.toString(cron);
                }


                $scope.prettyCronNext = function(cron) {
                    return $rootScope.getNext.toString(cron);
                }




                _triggerFetchData();
            }
        ])
    ;
}());
