
(function() {
    'use strict';

    angular.module('frontend.snapshots', [
    ]);

    // Module configuration
    angular.module('frontend.snapshots')
        .config([
            '$stateProvider',
            function config($stateProvider) {
                $stateProvider
                    .state('snapshots', {
                        url: '/snapshots',
                        parent : 'frontend',
                        data : {
                            access : 0,
                            pageName : "Snapshots",
                            displayName : null,
                            prefix : '<i class="mdi mdi-36px mdi-camera"></i>'
                        },
                        views: {
                            'content@': {
                                templateUrl: 'js/app/snapshots/index.html',
                                    controller: 'SnapshotsController'
                            },

                        }
                    })
                    .state('snapshots.show', {
                        url: '/:id',
                        parent : 'snapshots',
                        data : {
                            access : 0,
                            pageName : "Snapshot Details",
                            displayName : "snapshot details",
                            prefix : '<i class="mdi mdi-36px mdi-camera"></i>'
                        },
                        views: {
                            'content@': {
                                templateUrl: 'js/app/snapshots/snapshot.html',
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
