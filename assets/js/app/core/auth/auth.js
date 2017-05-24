/**
 * Angular module for frontend.core.auth component. This component is divided to following logical components:
 *
 *  frontend.core.auth.login
 *  frontend.core.auth.services
 */
(function() {
  'use strict';

  // Define frontend.auth module
  angular.module('frontend.core.auth', [
    'frontend.core.auth.login',
    'frontend.core.auth.signup',
    'frontend.core.auth.services'
  ]);

  // Module configuration
  angular.module('frontend.core.auth')
    .config([
      '$stateProvider',
      function config($stateProvider) {
        $stateProvider
          .state('auth', {
            abstract: true,
            parent: 'frontend',
            data: {
              access: 0
            },
              views: {
                  'content@': {
                      templateUrl: 'js/app/core/auth/layout.html',
                      controller: function($scope,$location) {


                      }
                  }
              }
          })
        ;
      }
    ])
}());
