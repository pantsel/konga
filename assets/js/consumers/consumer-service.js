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

          function clean(obj) {
              // Delete empty keys
              Object.keys(obj).forEach(function(key){
                  if(!obj[key]) delete obj[key]
              })

              return obj
          }

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
                  return $http.post(BackendConfig.url + '/kong/consumers',clean(consumer))
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

              addCredential : function(consumerId,credential,data) {
                  return $http.post(BackendConfig.url + '/kong/consumers/' + consumerId + '/' + credential,data)
              },

              loadCredentials : function(consumerId,credential) {
                  return $http.get(BackendConfig.url + '/kong/consumers/' + consumerId + '/' + credential)
              },

              listCredentials : function(consumerId) {
                  return $http.get(BackendConfig.url + '/kong/consumers/' + consumerId + '/credentials')
              },

              removeCredential : function(consumerId,credential,credential_id) {
                  return $http.delete(BackendConfig.url + '/kong/consumers/' + consumerId + '/' + credential + '/' + credential_id)
              },
          }
      }
    ])
  ;
}());
