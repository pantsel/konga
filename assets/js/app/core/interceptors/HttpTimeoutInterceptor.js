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
      .factory('timeoutHttpIntercept', ['HttpTimeout', function (HttpTimeout) {
        return {
          'request': function (config) {

              // Don't hang more that HttpTimeout waiting for response on GET requests.
              // Setting timeout on POST, PUT, PATCH or DELETE
              // will result in unwanted interruptions in data-heavy scenarios.
              if(config.method == 'GET') {
                  config.timeout = HttpTimeout;
              }

              return config;
          }
        }
      }]);
}());
