(function () {
  'use strict';

  angular.module('frontend.settings', []);

  // Module configuration
  angular.module('frontend.settings')
    .config([
      '$stateProvider',
      function config($stateProvider) {
        $stateProvider
          .state('settings', {
            url: '/settings',
            parent: 'frontend',
            data: {
              access: 0,
              pageName: "Settings",
              displayName: "settings",
              prefix: '<i class="mdi mdi-settings"></i>'
            },
            views: {
              'content@': {
                templateUrl: 'js/app/settings/index.html',
                controller: 'SettingsController',
                resolve: {
                  _integrations : ['$http', function ($http) {
                    return $http.get('api/settings/integrations');
                  }]
                }

              }
            }
          })

      }
    ])
  ;
}());
