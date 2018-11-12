/**
 * This file contains all necessary Angular controller definitions for 'frontend.admin.login-history' module.
 *
 * Note that this file should only contain controllers and nothing else.
 */
(function () {
  'use strict';

  angular.module('frontend.consumers')
    .service('ConsumerService', [
      '$log', '$state', '$http', 'BackendConfig',
      function ($log, $state, $http, BackendConfig) {

        function clean(obj) {
          // Delete empty keys
          Object.keys(obj).forEach(function (key) {
            if (!obj[key]) delete obj[key]
          })

          return obj
        }

        return {

          query: function (query) {
            return $http({
              url: 'kong/consumers',
              method: "GET",
              params: query
            })
          },

          findById: function (id) {
            return $http({
              url: 'kong/consumers/' + id,
              method: "GET"
            })
          },

          sync: function () {
            return $http.post(BackendConfig.url + '/consumers/sync')
          },

          create: function (consumer) {
            return $http.post('kong/consumers', clean(consumer))
          },

          update: function (id, data) {
            return $http.patch('kong/consumers/' + id, data)
          },

          delete: function (consumer) {
            return $http.delete('kong/consumers/' + consumer.id)
          },

          fetchAcls: function (consumerId) {
            return $http.get('kong/consumers/' + consumerId + '/acls')
          },

          addAcl: function (consumerId, data) {
            return $http.post('kong/consumers/' + consumerId + '/acls', data)
          },

          deleteAcl: function (consumerId, groupId) {
            return $http.delete('kong/consumers/' + consumerId + '/acls/' + groupId)
          },

          addCredential: function (consumerId, credential, data) {
            return $http.post('kong/consumers/' + consumerId + '/' + credential, data)
          },

          updateCredential: function (consumerId, credential, credential_id, data) {
            return $http.put('kong/consumers/' + consumerId + '/' + credential + '/' + credential_id, data)
          },

          loadCredentials: function (consumerId, credential) {
            return $http.get('kong/consumers/' + consumerId + '/' + credential)
          },

          listPlugins: function (consumerId) {
            return $http.get('kong/consumers/' + consumerId + '/plugins');
          },

          listApis: function (consumerId) {
            return $http.get('api/kong_consumers/' + consumerId + '/apis');
          },
          listServices : function(consumerId) {
            return $http.get('api/kong_consumers/' + consumerId + '/services');
          },
          listRoutes : function(consumerId) {
            return $http.get('api/kong_consumers/' + consumerId + '/routes');
          },
          listCredentials: function (consumerId) {
            return $http.get('kong/consumers/' + consumerId + '/credentials')
          },

          removeCredential: function (consumerId, credential, credential_id) {
            return $http.delete('kong/consumers/' + consumerId + '/' + credential + '/' + credential_id)
          },
        }
      }
    ])
  ;
}());
