/**
 * This file contains all necessary Angular controller definitions for 'frontend.login-history' module.
 *
 * Note that this file should only contain controllers and nothing else.
 */
(function () {
  'use strict';

  angular.module('frontend.services')
    .service('ServiceService', [
      '$log', '$state', '$http', 'Semver',
      function ($log, $state, $http, Semver) {


        /**
         *
         * IMPORTANT!!
         * Each key must have a respective .html file in /services/partials
         */
        var properties = {
          '013': {
            name: '',
            host: '',
            protocol: '',
            port: null,
            path: '',
            retries: 5,
            connect_timeout: 60000,
            write_timeout: 60000,
            read_timeout: 60000
          }
        }

        return {

          getProperties: function (version) {

            var fver = version.split('.').slice(0, -1).join('');
            var props = properties[fver] || properties[Object.keys(properties)[Object.keys(properties).length - 1]];

            // Kong 0.11.x fix
            if (Semver.cmp(version, "0.11.0") >= 0 && props.http_if_terminated !== undefined) {
              props.http_if_terminated = false;
            }

            // Add tags property
            if (Semver.cmp(version, "1.1.0-rc1") >= 0 && !props.tags) {
              props.tags = [];
            }

            return props;
          },

          getLastAvailableFormattedVersion: function (version) {

            var fver = version.split('.').slice(0, -1).join('');

            var existing = Object.keys(properties).indexOf(fver) >= 0 ? fver : Object.keys(properties)[Object.keys(properties).length - 1];

            return existing;
          },

          all: function () {
            return $http.get('kong/services')
          },

          findById: function (serviceId) {
            return $http.get('kong/services/' + serviceId)
          },

          update: function (service) {
            return $http.patch('kong/services/' + service.id, service)
          },

          getTags: function () {
            return $http.get('api/kongservices/tags')
          },

          delete: function (service) {
            return $http.delete('kong/services/' + service.id)
          },

          add: function (service) {
            return $http.post('kong/services/', service)
          },

          plugins: function (serviceId,params) {
            return $http.get('kong/services/' + serviceId + '/plugins',{
              params: params
            })
          },

          consumers: function (serviceId,params) {
            return $http.get('api/kong_services/' + serviceId + '/consumers', {
              params: params
            })
          },

          addPlugin: function (serviceId, plugin) {
            for (var key in plugin) {
              if (!plugin[key] || plugin[key] == '') delete plugin[key]
            }

            return $http.post('kong/services/' + serviceId + '/plugins', plugin)


          },

          updatePlugin: function (serviceId, pluginId, data) {

            if (data.config) {
              for (var key in data.config) {
                data['config.' + key] = data.config[key]
              }
              delete data.config
            }

            return $http.patch('kong/services/' + serviceId + '/plugins/' + pluginId, data)
          },

          deletePlugin: function (serviceId, pluginId) {
            return $http.delete('kong/services/' + serviceId + '/plugins/' + pluginId)
          },

          routes: function (serviceId) {
            return $http.get('kong/services/' + serviceId + '/routes')
          }
        }
      }
    ])
  ;
}());
