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

          return {

              all : function() {
                  return $http.get(BackendConfig.url + '/kong/apis')
              },

              findById : function(apiId) {
                  return $http.get(BackendConfig.url + '/kong/apis/' + apiId)
              },

              update : function(api) {
                  return $http.patch(BackendConfig.url + '/kong/apis/' + api.id,api)
              },

              delete : function(api) {
                  return $http.delete(BackendConfig.url + '/kong/apis/' + api.id)
              },

              add : function(api) {
                  return $http.post(BackendConfig.url + '/kong/apis/',api)
              },

              plugins : function(apiId) {
                  return $http.get(BackendConfig.url + '/kong/apis/' + apiId + '/plugins')
              },


              addPlugin : function(apiId,plugin) {
                  for(var key in plugin) {
                      if(!plugin[key] || plugin[key] == '') delete plugin[key]
                  }

                  return $http.post(BackendConfig.url + '/kong/apis/' + apiId + '/plugins',plugin)


              },

              updatePlugin : function(apiId,pluginId,data) {

                  if(data.config) {
                      for(var key in data.config){
                          data['config.' + key] = data.config[key]
                      }
                      delete data.config
                  }

                  return $http.patch(BackendConfig.url + '/kong/apis/' + apiId + '/plugins/' + pluginId,data)
              },

              deletePlugin : function(apiId,pluginId) {
                  return $http.delete(BackendConfig.url + '/kong/apis/' + apiId + '/plugins/' + pluginId)
              }
          }
      }
    ])
  ;
}());
