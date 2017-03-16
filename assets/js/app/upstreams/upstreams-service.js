/**
 * This file contains all necessary Angular controller definitions for 'frontend.admin.login-history' module.
 *
 * Note that this file should only contain controllers and nothing else.
 */
(function() {
  'use strict';

  angular.module('frontend.upstreams')
    .service('UpstreamsService', [
        '$log', '$state','$http',
      function( $log, $state, $http) {

          var path = '/upstreams'

          function clean(obj) {
              // Delete empty keys
              Object.keys(obj).forEach(function(key){
                  if(!obj[key]) delete obj[key]
              })

              return obj
          }

          return {

              load : function(query) {
                  return $http({
                      url : 'kong' + path,
                      method: "GET",
                      params : query
                  })
              }

          }
      }
    ])
  ;
}());
