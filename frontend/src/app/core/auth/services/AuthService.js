/**
 * AuthService service which is used to authenticate users with backend server and provide simple
 * methods to check if user is authenticated or not.
 *
 * Within successfully login process service will store user data and JWT token to ngStorage where
 * those are accessible in the application.
 *
 * This service provides following methods:
 *
 *  AuthService.authorize(access)
 *  AuthService.isAuthenticated()
 *  AuthService.login(credentials)
 *  AuthService.logout()
 *
 * You can use this service fairly easy on your controllers and views if you like to. It's
 * recommend that you use this service with 'UserService' service in your controllers and
 * views.
 *
 * Usage example in controller:
 *
 *  angular
 *    .module('app')
 *    .controller('SomeController', [
 *      '$scope', 'AuthService', 'UserService',
 *      function ($scope, AuthService, UserService) {
 *        $scope.auth = AuthService;
 *        $scope.user = UserService.user;
 *      }
 *    ])
 *  ;
 *
 * Usage example in view:
 *
 *  <div data-ng-show="auth.isAuthenticated()">
 *      Hello, <strong>{{user().email}}</strong>
 *  </div>
 *
 * Happy coding!
 *
 * @todo  Revoke method?
 * @todo  Text localizations?
 */
(function() {
  'use strict';

  angular.module('frontend.core.auth.services')
    .factory('AuthService', [
      '$http', '$state', '$localStorage',
      'AccessLevels', 'BackendConfig', 'MessageService',
      function factory(
        $http, $state, $localStorage,
        AccessLevels, BackendConfig, MessageService
      ) {
        return {
          /**
           * Method to authorize current user with given access level in application.
           *
           * @param   {Number}    accessLevel Access level to check
           *
           * @returns {Boolean}
           */
          authorize: function authorize(accessLevel) {
            if (accessLevel === AccessLevels.user) {
              return this.isAuthenticated();
            } else if (accessLevel === AccessLevels.admin) {
              return this.isAuthenticated() && Boolean($localStorage.credentials.user.admin);
            } else {
              return accessLevel === AccessLevels.anon;
            }
          },

          /**
           * Method to check if current user is authenticated or not. This will just
           * simply call 'Storage' service 'get' method and returns it results.
           *
           * @returns {Boolean}
           */
          isAuthenticated: function isAuthenticated() {
            return Boolean($localStorage.credentials);
          },

          /**
           * Method make login request to backend server. Successfully response from
           * server contains user data and JWT token as in JSON object. After successful
           * authentication method will store user data and JWT token to local storage
           * where those can be used.
           *
           * @param   {*} credentials
           *
           * @returns {*|Promise}
           */
          login: function login(credentials) {
            return $http
              .post(BackendConfig.url + '/login', credentials, {withCredentials: true})
              .then(
                function(response) {
                  MessageService.success('You have been logged in.');

                  $localStorage.credentials = response.data;
                }
              )
            ;
          },

          /**
           * The backend doesn't care about actual user logout, just delete the token
           * and you're good to go.
           *
           * Question still: Should we make logout process to backend side?
           */
          logout: function logout() {
            $localStorage.$reset();

            MessageService.success('You have been logged out.');

            $state.go('auth.login');
          }
        };
      }
    ])
  ;
}());
