/**
 * This file contains all necessary Angular controller definitions for 'frontend.login-history' module.
 *
 * Note that this file should only contain controllers and nothing else.
 */
(function () {
  'use strict';

  angular.module('frontend.routes')
    .service('RoutesService', [
      '$log', '$state', '$http', 'Semver',
      function ($log, $state, $http, Semver) {


        /**
         *
         * IMPORTANT!!
         * Each key must have a respective .html file in /routes/partials
         */
        var properties = {
          '013': {
            name: '',
            hosts: [],
            protocols: ["http", "https"],
            methods: [],
            headers: [],
            paths: [],
            strip_path: true,
            preserve_host: false,
            https_redirect_status_code: 426,
            regex_priority: 0,
            snis: [],
            sources: [],
            destinations: []
          },
          '015': {
            name: '',
            hosts: [],
            protocols: ["http", "https"],
            methods: [],
            paths: [],
            headers: [],
            path_handling: "v1",
            strip_path: true,
            preserve_host: false,
            https_redirect_status_code: 426,
            regex_priority: 0,
            snis: [],
            sources: [],
            destinations: []
          }
        }

        return {

          getProperties: function (version) {

            var fver = version.split('.').slice(0, -1).join('');
            var props = properties[fver] || properties[Object.keys(properties)[Object.keys(properties).length - 1]];

            return props;
          },

          getLastAvailableFormattedVersion: function (version) {

            var fver = version.split('.').slice(0, -1).join('');

            var existing = Object.keys(properties).indexOf(fver) >= 0 ? fver : Object.keys(properties)[Object.keys(properties).length - 1];

            return existing;
          },

          all: function () {
            return $http.get('kong/routes')
          },

          findById: function (routeId) {
            return $http.get('kong/routes/' + routeId)
          },

          update: function (routeId, data) {
            return $http.patch('kong/routes/' + routeId, data)
          },

          delete: function (route) {
            return $http.delete('kong/routes/' + route.id);
          },

          add: function (route) {
            return $http.post('kong/routes/', route);
          },

          plugins: function (routeId) {
            return $http.get('kong/routes/' + routeId + '/plugins')
          },


          addPlugin: function (routeId, plugin) {
            for (var key in plugin) {
              if (!plugin[key] || plugin[key] == '') delete plugin[key]
            }

            return $http.post('kong/routes/' + routeId + '/plugins', plugin)


          },

          consumers: function (routeId) {
            return $http.get('api/kong_routes/' + routeId + '/consumers')
          },

          updatePlugin: function (routeId, pluginId, data) {

            if (data.config) {
              for (var key in data.config) {
                data['config.' + key] = data.config[key]
              }
              delete data.config
            }

            return $http.patch('kong/routes/' + routeId + '/plugins/' + pluginId, data)
          },

          deletePlugin: function (routeId, pluginId) {
            return $http.delete('kong/routes/' + routeId + '/plugins/' + pluginId)
          }
        }
      }
    ])
  ;
}());
