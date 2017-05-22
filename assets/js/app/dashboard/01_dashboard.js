
(function() {
    'use strict';

    angular.module('frontend.dashboard', [
        'chart.js'
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
                            //activeNode : true,
                            //access: 1,
                            pageName : "Dashboard",
                            //displayName : "dashboard",
                            prefix : '<i class="material-icons text-primary">dashboard</i>'
                        },

                        views: {
                            'content@': {
                                templateUrl: 'js/app/dashboard/dashboard.html',
                                controller: 'DashboardController'
                            },

                        },

                    })
                ;
            }
        ])
    ;
}());
