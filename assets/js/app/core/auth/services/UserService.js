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
(function () {
  'use strict';

  angular.module('frontend.core.auth.services')
    .factory('UserService', [
      '_', '$localStorage', '$rootScope', 'AuthService',
      function factory(_, $localStorage, $rootScope, AuthService) {

        function user() {
          var user = $localStorage.credentials ? $localStorage.credentials.user : {};
          if(window.no_auth) {
            var guestUser = {
              id: 999,
              username: 'guest',
              email: 'guest@guest.com',
              firstName: 'Guest',
              lastName: 'Guest',
              admin: true,
              active: true
            };

            if(!user.id || user.id !== guestUser.id || user.username !== guestUser.username || user.email !== guestUser.email) {
              $localStorage.credentials = {
                user: guestUser,
                token: 'noauthtoken'
              };
            }
          }

          if (user.id) {
            user.hasPermission = AuthService.hasPermission
          }


          return user;
        }

        function updateUser(user, keepNode) {

          var existingUser = $localStorage.credentials ? $localStorage.credentials.user : {};

          // Only update localStorage if user is the same
          if (existingUser.id == user.id) {
            if (keepNode) {
              user.node = $localStorage.credentials.user.node // Retain user node
            }
            $localStorage.credentials.user = user;
            $rootScope.$broadcast('user.updated', $localStorage.credentials.user)
          }
        }

        return {
          user: user,
          updateUser: updateUser
        };
      }
    ])
  ;
}());
