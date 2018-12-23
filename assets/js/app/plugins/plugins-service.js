/**
 * This file contains all necessary Angular controller definitions for 'frontend.admin.login-history' module.
 *
 * Note that this file should only contain controllers and nothing else.
 */
(function () {
  'use strict';

  angular.module('frontend.plugins')
    .service('PluginsService', [
      '$log', '$state', '$http', 'BackendConfig',
      function ($log, $state, $http, BackendConfig) {

        return {

          load: function (query) {
            return $http.get('kong/plugins', {
              params: query
            });
          },

          add: function (data) {
            // Delete unset config fields
            return $http.post('kong/plugins', data);
          },

          update: function (id, data) {
            return $http.patch('kong/plugins/' + id, data);
          },

          fetch: function (pluginId) {
            return $http.get('kong/plugins/' + pluginId);
          },

          schema: function (name) {
            return $http.get('kong/plugins/schema/' + name);
          },

          enabled: function () {
            return $http.get('kong/plugins/enabled');
          },

          delete: function (id) {
            return $http.delete('kong/plugins/' + id);
          }
        }
      }
    ])
  ;
}());
