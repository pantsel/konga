
(function() {
  'use strict';

  angular.module('frontend.core.interceptors')
    .factory('TemplateCacheInterceptor', [
      function() {
        return {
          request: function( config ) {
            if( config.url.indexOf( ".html") > -1) {
              config.url += '?' + new Date().getTime
            }
            return config;
          }
        };
      }
    ])
  ;
}());
