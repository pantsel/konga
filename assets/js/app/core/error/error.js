// Generic models angular module initialize.
(function() {
  'use strict';

  angular.module('frontend.core.error', []);

  // Module configuration
  angular.module('frontend.core.error')
    .config([
      '$stateProvider',
      function config($stateProvider) {
        $stateProvider
          .state('error', {
            parent: 'frontend',
            url: '/error',
            data: {
                access: 0,
                pageName : "Error",
                displayName : "error",
            },
            views: {
              'content@': {
                templateUrl: 'js/app/core/error/partials/error.html',
                controller: 'ErrorController',
                resolve: {
                  _error: function resolve() {
                    return this.self.error;
                  }
                }
              }
            }
          })
        ;
      }
    ])
    .controller('ErrorController', [
          '$scope', '$state',
          '_',
          '_error',
          function controller(
              $scope, $state,
              _,
              _error
          ) {
              if (_.isUndefined(_error)) {
                  return $state.go('auth.login');
              }

              $scope.error = _error;

          }
      ])
  ;
}());
