/**
 * Auth interceptor for HTTP and Socket request. This interceptor will add required
 * JWT (Json Web Token) token to each requests. That token is validated in server side
 * application.
 *
 * @see http://angular-tips.com/blog/2014/05/json-web-tokens-introduction/
 * @see http://angular-tips.com/blog/2014/05/json-web-tokens-examples/
 */
(function() {
  'use strict';

  angular.module('frontend.core.interceptors')
    .factory('KongaInterceptor', [
      '$q', '$injector', '$localStorage',
      function(
        $q, $injector, $localStorage
      ) {
        return {
          /**
           * Interceptor method for $http requests. Main purpose of this method is to add JWT token
           * to every request that application does.
           *
           * @param   {*} config  HTTP request configuration
           *
           * @returns {*}
           */
          request: function requestCallback(config) {

            var kong_admin_url = '';

            // Yeah we have some user data on local storage
            if ($localStorage.credentials && $localStorage.credentials.user.node) {
                kong_admin_url = $localStorage.credentials.user.node.kong_admin_url
            }

            config.headers['kong-admin-url'] = kong_admin_url;

            return config;
          }
        };
      }
    ])
  ;
}());
