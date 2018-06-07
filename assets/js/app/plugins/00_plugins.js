(function () {
  'use strict';

  angular.module('frontend.plugins', []);

  // Module configuration
  angular.module('frontend.plugins')
    .config([
      '$stateProvider',
      function config($stateProvider) {
        $stateProvider
          .state('plugins', {
            parent: 'frontend',
            url: '/plugins',
            data: {
              activeNode: true,
              pageName: "Plugins",
              pageDescription: "A Plugin entity represents a plugin configuration that will be executed during the HTTP request/response workflow, and it's how you can add functionalities to APIs that run behind Kong, like Authentication or Rate Limiting for example.",
              //displayName : "plugins",
              prefix: '<i class="material-icons text-primary">settings_input_component</i>'
            },
            views: {
              'content@': {
                templateUrl: 'js/app/plugins/plugins.html',
                controller: 'PluginsController'
              }
            }
          })
          .state('plugins.add', {
            url: '/add',
            params: {
              api: {}
            },
            data: {
              pageName: "Add Global Plugins",
              pageDescription: null,
              displayName: "add"
            },
            views: {
              'content@': {
                templateUrl: 'js/app/plugins/add-plugins.html',
                controller: 'AddPluginsController',
                resolve: {
                  _plugins: [
                    '$stateParams',
                    'PluginsService',
                    '$log',
                    function resolve(
                      $stateParams,
                      PluginsService,
                      $log
                    ) {
                      return PluginsService.load()
                    }
                  ],
                  _info: [
                    '$stateParams',
                    'InfoService',
                    '$log',
                    function resolve(
                      $stateParams,
                      InfoService,
                      $log
                    ) {
                      return InfoService.getInfo()
                    }
                  ],
                  _activeNode: [
                    'NodesService',
                    function resolve(NodesService) {

                      return NodesService.isActiveNodeSet()
                    }
                  ],
                }
              }
            },
          })
      }
    ])
  ;
}());
