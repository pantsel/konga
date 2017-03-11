/**
 * Current user data service within this you can access to currently signed in user data.
 * Note that if you wanna be secure about this you have to also use 'Auth' service in your
 * views.
 *
 * Usage example in controller:
 *  angular
 *    .module('app')
 *    .controller('SomeController',[
 *      '$scope', 'AuthService', 'UserService',
 *      function controller($scope, AuthService, UserService) {
 *        $scope.auth = AuthService;
 *        $scope.user = UserService.user;
 *      }
 *    ])
 *  ;
 *
 * Usage example in view:
 *  <div data-ng-show="auth.isAuthenticated()">
 *      Hello, <strong>{{user().email}}</strong>
 *  </div>
 *
 * Happy coding!
 */
(function() {
  'use strict';

  angular.module('frontend.core.auth.services')
    .factory('UserService', [
      '$localStorage',
      function factory($localStorage) {
        return {
          user: function user() {
            return $localStorage.credentials ? $localStorage.credentials.user : {};
          },
        };
      }
    ])
  ;
}());
