/**
 * This file contains all necessary Angular controller definitions for 'frontend.admin.login-history' module.
 *
 * Note that this file should only contain controllers and nothing else.
 */
(function() {
  'use strict';

  angular.module('frontend.consumers')
    .service('ConsumerService', [
        '$log', '$state','$http','BackendConfig',
      function( $log, $state, $http,BackendConfig) {

          return {

              query : function(query) {
                  return $http({
                      url : BackendConfig.url + '/kong/consumers',
                      method: "GET",
                      params : query
                  })
              },

              findById : function(id) {
                  return $http({
                      url : BackendConfig.url + '/kong/consumers/' + id,
                      method: "GET"
                  })
              },

              sync : function() {
                  return $http.post(BackendConfig.url + '/consumers/sync')
              },

              create : function(consumer) {
                  return $http.post(BackendConfig.url + '/kong/consumers',consumer)
              },

              update : function(id,data) {
                  return $http.patch(BackendConfig.url + '/kong/consumers/' + id,data)
              },

              delete : function(consumer) {
                  return $http.delete(BackendConfig.url + '/kong/consumers/' + consumer.id)
              },

              fetchAcls : function(consumerId) {
                  return $http.get(BackendConfig.url + '/kong/consumers/' + consumerId + '/acls')
              },

              addAcl : function(consumerId,data) {
                  return $http.post(BackendConfig.url + '/kong/consumers/' + consumerId + '/acls',data)
              },

              deleteAcl : function(consumerId,groupId) {
                  return $http.delete(BackendConfig.url + '/kong/consumers/' + consumerId + '/acls/' + groupId)
              },

              createApiKey : function(consumerId,data) {
                  return $http.post(BackendConfig.url + '/kong/consumers/' + consumerId + '/key-auth',data)
              },

              fetchKeys : function(consumerId) {
                  return $http.get(BackendConfig.url + '/kong/consumers/' + consumerId + '/key-auth')
              },

              deleteKey : function(consumerId,keyId) {
                  return $http.delete(BackendConfig.url + '/kong/consumers/' + consumerId + '/key-auth/' + keyId)
              },



              createJWT : function(consumerId,data) {
                  return $http.post(BackendConfig.url + '/kong/consumers/' + consumerId + '/jwt',data)
              },

              fetchJWTs : function(consumerId) {
                  return $http.get(BackendConfig.url + '/kong/consumers/' + consumerId + '/jwt')
              },

              deleteJWT : function(consumerId,jwtId) {
                  return $http.delete(BackendConfig.url + '/kong/consumers/' + consumerId + '/jwt/' + jwtId)
              },


              // BASIC AUTH
              createBasicAuthCredentials : function(consumerId,data) {
                  return $http.post(BackendConfig.url + '/kong/consumers/' + consumerId + '/basic-auth',data)
              },

              fetchBasicAuthCredentials : function(consumerId) {
                  return $http.get(BackendConfig.url + '/kong/consumers/' + consumerId + '/basic-auth')
              },

              deleteBasicAuthCredentials : function(consumerId,cId) {
                  return $http.delete(BackendConfig.url + '/kong/consumers/' + consumerId + '/basic-auth/' + cId)
              },

              // HMAC AUTH
              createHMACAuthCredentials : function(consumerId,data) {
                  return $http.post(BackendConfig.url + '/kong/consumers/' + consumerId + '/hmac-auth',data)
              },

              fetchHMACAuthCredentials : function(consumerId) {
                  return $http.get(BackendConfig.url + '/kong/consumers/' + consumerId + '/hmac-auth')
              },

              deleteHMACAuthCredentials : function(consumerId,cId) {
                  return $http.delete(BackendConfig.url + '/kong/consumers/' + consumerId + '/hmac-auth/' + cId)
              },

          }
      }
    ])
  ;
}());
