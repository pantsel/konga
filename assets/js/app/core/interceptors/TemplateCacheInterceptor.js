/**
 * Interceptor for $http and $sailSocket request to handle possible errors and show
 * that error to user automatically. Message is shown by application 'Message' service
 * which uses noty library.
 *
 * @todo Add option to skip showing automatic error message
 */
(function() {
  'use strict';

  angular.module('frontend.core.interceptors')
    .factory('TemplateCacheInterceptor', [
      function() {
        return {
          request: function( config ) {
            if( config.url.indexOf( ".html", config.url.length - ".html".length ) !== -1 ) {}
            return config;
          }
        };
      }
    ])
  ;
}());
