
(function() {
    'use strict';

    angular.module('frontend.netdataConnections', [
    ]);

    // Module configuration
    angular.module('frontend.netdataConnections')
        .config([
            '$stateProvider',
            function config($stateProvider) {
                // $stateProvider
                //     .state('settings', {
                //         url: '/settings',
                //         parent: 'frontend',
                //         data: {
                //             access: 0,
                //             pageName: "Settings",
                //             displayName: "settings",
                //             prefix: '<i class="mdi mdi-settings"></i>'
                //         },
                //         views: {
                //             'content@': {
                //                 templateUrl: 'js/app/settings/index.html',
                //                 controller: 'SettingsController',
                //             }
                //         }
                //     })

            }
        ])
    ;
}());
