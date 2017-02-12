/**
 * Frontend application backend constant definitions. This is something that you must define in your application.
 *
 * Note that 'BackendConfig.url' is configured in /frontend/config/config.json file and you _must_ change it to match
 * your backend API url.
 */
(function() {
  'use strict';

  angular.module('frontend')
    .constant('BackendConfig', {
      url: window.io.sails.env_backend_url === '@@envBackendUrl' ? window.io.sails.url : window.io.sails.env_backend_url
    })
  ;
}());
