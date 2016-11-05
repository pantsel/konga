
(function() {
    'use strict';

    angular.module('frontend.dashboard', [
        'chart.js',
        'angular-matchheight'
    ]);

    // Module configuration
    angular.module('frontend.dashboard')
        .config([
            '$stateProvider',
            function config($stateProvider) {
                $stateProvider
                    .state('dashboard', {
                        url: '/dashboard',
                        parent : 'frontend',
                        data : {
                            access: 0,
                            pageName : "Dashboard",
                            displayName : "dashboard",
                            prefix : '<i class="material-icons text-primary">dashboard</i>'
                        },

                        views: {
                            'content@': {
                                templateUrl: '/frontend/dashboard/dashboard.html',
                                controller: 'DashboardController',
                                resolve : {
                                    _activeNode: [
                                        'NodesService',
                                        function resolve(NodesService) {

                                            return NodesService.isActiveNodeSet()
                                        }
                                    ],
                                }
                            },

                        },

                    })
                ;
            }
        ])
    ;
}());
