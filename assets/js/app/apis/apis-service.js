/**
 * This file contains all necessary Angular controller definitions for 'frontend.login-history' module.
 *
 * Note that this file should only contain controllers and nothing else.
 */
(function() {
  'use strict';

  angular.module('frontend.apis')
    .service('ApiService', [
        '$log', '$state','$http','BackendConfig',
      function( $log, $state, $http,BackendConfig) {

          var properties = {
              '0-9-x': {
                  name: '',
                  request_host: '',
                  request_path: '',
                  strip_request_path: false,
                  preserve_host: false,
                  upstream_url: ''
              },
              '0-10-x' : {
                  name : '',
                  hosts : '',
                  uris : '',
                  methods : '',
                  strip_uri : true,
                  preserve_host: false,
                  retries : 5,
                  upstream_connect_timeout : 6000,
                  upstream_send_timeout : 6000,
                  upstream_read_timeout : 6000,
                  https_only:false,
                  http_if_terminated:true,
                  upstream_url : ''
              }
          }

          return {

              getProperties : function(version) {
                return properties[version]
              },

              all : function() {
                  return $http.get('kong/apis')
              },

              findById : function(apiId) {
                  return $http.get('kong/apis/' + apiId)
              },

              update : function(api) {
                  return $http.patch('kong/apis/' + api.id,api)
              },

              delete : function(api) {
                  return $http.delete('kong/apis/' + api.id)
              },

              add : function(api) {
                  return $http.post('kong/apis/',api)
              },

              plugins : function(apiId) {
                  return $http.get('kong/apis/' + apiId + '/plugins')
              },


              addPlugin : function(apiId,plugin) {
                  for(var key in plugin) {
                      if(!plugin[key] || plugin[key] == '') delete plugin[key]
                  }

                  return $http.post('kong/apis/' + apiId + '/plugins',plugin)


              },

              updatePlugin : function(apiId,pluginId,data) {

                  if(data.config) {
                      for(var key in data.config){
                          data['config.' + key] = data.config[key]
                      }
                      delete data.config
                  }

                  return $http.patch('kong/apis/' + apiId + '/plugins/' + pluginId,data)
              },

              deletePlugin : function(apiId,pluginId) {
                  return $http.delete('kong/apis/' + apiId + '/plugins/' + pluginId)
              }
          }
      }
    ])
  ;
}());
