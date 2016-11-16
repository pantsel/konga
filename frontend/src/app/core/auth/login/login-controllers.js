/**
 * This file contains all necessary Angular controller definitions for 'frontend.auth.login' module.
 *
 * Note that this file should only contain controllers and nothing else.
 */
(function() {
  'use strict';

  /**
   * Login controller to handle user's login to application. Controller uses 'Auth' service to make actual HTTP
   * request to server and try to authenticate user.
   *
   * After successfully login Auth service will store user data and JWT token via 'Storage' service where those are
   * asked whenever needed in application.
   *
   * @todo
   *  1) different authentication providers
   *  2) user registration
   */
  angular.module('frontend.core.auth.login')
    .controller('LoginController', [
      '$scope', '$state',
      'AuthService', 'FocusOnService',
      function controller(
        $scope, $state,
        AuthService, FocusOnService
      ) {
        // Already authenticated so to dashboard
        if (AuthService.isAuthenticated()) {
          $state.go('dashboard');
        }

        // Scope function to perform actual login request to server
        $scope.login = function login() {
          AuthService
            .login($scope.credentials)
            .then(
              function successCallback() {
                $state.go('dashboard');
              },
              function errorCallback() {
                _reset();
              }
            )
          ;
        };

        /**
         * Private helper function to reset credentials and set focus to username input.
         *
         * @private
         */
        function _reset() {
          FocusOnService.focus('username');

          // Initialize credentials
          $scope.credentials = {
            identifier: '',
            password: ''
          };
        }

        _reset();
      }
    ])
  ;
}());
