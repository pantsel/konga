
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
                        data : {
                            access : 0,
                            pageName : "Settings",
                            displayName : "settings",
                            prefix : '<i class="material-icons">&#xE8B8;</i>'
                        },
                        views: {
                            'content@': {
                                templateUrl: 'js/app/settings/index.html',
                                controller: 'SettingsController'
                            },
                            'nodes@settings': {
                                templateUrl: 'js/app/settings/nodes/list.html',
                                controller: 'NodesController',
                            },
                            'snapshots@settings': {
                                templateUrl: 'js/app/settings/snapshots/list.html',
                                controller: 'SnapshotsController',
                            },
                        }
                    })
                    .state('settings.snapshot', {
                        url: '/snapshot/:id',
                        parent : 'settings',
                        data : {
                            access : 0,
                            pageName : "Snapshot Details",
                            displayName : "snapshot",
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
