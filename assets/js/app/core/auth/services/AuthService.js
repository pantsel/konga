(function () {
  'use strict';

  angular.module('frontend.core.auth.services')
    .factory('AuthService', [
      '$http', '$state', '$localStorage', '$rootScope',
      'AccessLevels', 'BackendConfig', 'MessageService',
      function factory($http, $state, $localStorage, $rootScope,
                       AccessLevels, BackendConfig, MessageService) {
        return {
          /**
           * Method to authorize current user with given access level in application.
           *
           * @param   {Number}    accessLevel Access level to check
           *
           * @returns {Boolean}
           */
          authorize: function authorize(accessLevel) {

            if(window.no_auth) return true;

            if (accessLevel === AccessLevels.user) {
              return this.isAuthenticated();
            } else if (accessLevel === AccessLevels.admin) {
              return this.isAuthenticated() && Boolean($localStorage.credentials.user.admin);
            } else {
              return accessLevel === AccessLevels.anon;
            }
          },

          hasPermission: function (context, action) {

            if(window.no_auth) return true;

            // If user is admin or  context is not a permissions Object key, grant permission
            if (($localStorage.credentials && $localStorage.credentials.user.admin)
              || Object.keys(KONGA_CONFIG.user_permissions).indexOf(context) < 0) {
              return true;
            }

            action = action || 'read'; // Default action is 'read'

            /**
             * ======================================================================================
             * Monkey patches.
             * ======================================================================================
             */

            // Transform 'edit' action to 'update'
            // because permissions object complies to CRUD naming.
            // ToDo : Change 'edit' route uri segments to 'update'
            if (action === 'edit') {
              action = 'update';
            }

            /**
             * ======================================================================================
             * End monkey patches.
             * ======================================================================================
             */

            return KONGA_CONFIG.user_permissions[context]
              && KONGA_CONFIG.user_permissions[context][action] === true

          },

          /**
           * Method to check if current user is authenticated or not. This will just
           * simply call 'Storage' service 'get' method and returns it results.
           *
           * @returns {Boolean}
           */
          isAuthenticated: function isAuthenticated() {
            if(window.no_auth) return true;
            return Boolean($localStorage.credentials);
          },


          /**
           * Method to check if current user is an admin or not.
           *
           * @returns {Boolean}
           */
          isAdmin: function isAdmin() {
            if(window.no_auth) return true;
            return $localStorage.credentials && $localStorage.credentials.user && $localStorage.credentials.user.admin;

          },


          token: function token() {
            return $localStorage.credentials ? $localStorage.credentials.token : null;
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
              .post('login', credentials, {withCredentials: true})
              .then(
                function (response) {
                  MessageService.success('You have logged in successfully!');
                  $localStorage.credentials = response.data;
                  $rootScope.$broadcast('user.login', $localStorage.credentials)
                  $rootScope.user = response.data.user;
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
            MessageService.success('You have logged out.');
            $rootScope.user = null;
            $state.go('auth.login');
          }
        };
      }
    ])
  ;
}());
