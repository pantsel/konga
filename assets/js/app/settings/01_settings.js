
(function() {
    'use strict';

    angular.module('frontend.settings', [
    ]);

    // Module configuration
    angular.module('frontend.settings')
        .config([
            '$stateProvider',
            function config($stateProvider) {
                $stateProvider
                    .state('settings', {
                        url: '/settings',
                        parent : 'frontend',
                        abstract: true,
                        data : {
                            access : 0,
                            pageName : "Settings",
                            displayName : "settings",
                            prefix : '<i class="material-icons">&#xE8B8;</i>'
                        },
                        views: {
                            'content@': {
                                templateUrl: 'js/app/settings/index.html',
                                controller: ['$scope', '$state',
                                    function( $scope, $state) {
                                        //$state.go('settings.connections');
                                    }],
                            },
                            //'nodes@settings': {
                            //    templateUrl: 'js/app/settings/nodes/list.html',
                            //    controller: 'NodesController',
                            //},
                            //'snapshots@settings': {
                            //    templateUrl: 'js/app/settings/snapshots/list.html',
                            //    controller: 'SnapshotsController',
                            //},
                        }
                    })
                    .state('settings.connections', {
                        url: '/connections',
                        parent : 'settings',
                        data : {
                            access : 0,
                            //pageName : "Connections",
                            displayName : "connections",
                            //prefix : '<i class="material-icons">&#xE412;</i>'
                        },
                        views: {
                            'settingsContent': {
                                templateUrl: 'js/app/settings/nodes/list.html',
                                controller: 'NodesController',
                            },
                        }
                    })
                    .state('settings.snapshots', {
                        url: '/snapshots',
                        parent : 'settings',
                        data : {
                            access : 0,
                            //pageName : "Snapshots",
                            displayName : "snapshots",
                            //prefix : '<i class="material-icons">&#xE412;</i>'
                        },
                        views: {
                            'settingsContent': {
                                templateUrl: 'js/app/settings/snapshots/list.html',
                                controller: 'SnapshotsController'
                            },
                        }
                    })
                    .state('settings.snapshots.show', {
                        url: '/:id',
                        parent : 'settings.snapshots',
                        data : {
                            access : 0,
                            pageName : "Snapshot Details",
                            displayName : "snapshot details",
                            prefix : '<i class="material-icons">&#xE412;</i>'
                        },
                        views: {
                            'content@': {
                                templateUrl: 'js/app/settings/snapshots/snapshot.html',
                                controller: 'SnapshotController',
                                resolve : {
                                    _snapshot : ['Snapshot','$stateParams',
                                        function(Snapshot,$stateParams){
                                        return Snapshot.fetch($stateParams.id)
                                    }]
                                }
                            },
                        }
                    })
            }
        ])
    ;
}());
