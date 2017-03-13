/**
 * Frontend application backend constant definitions. This is something that you must define in your application.
 *
 * Note that 'BackendConfig.url' is configured in js/config/config.json file and you _must_ change it to match
 * your backend API url.
 */
(function() {
  'use strict';

  angular.module('frontend')
    .constant('BackendConfig', {
      url: ''
    })
  ;
}());
