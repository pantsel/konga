/**
 * This file contains all necessary Angular controller definitions for 'frontend.login-history' module.
 *
 * Note that this file should only contain controllers and nothing else.
 */
(function () {
    'use strict';

    angular.module('frontend.routes')
        .service('RouteService', [
            '$log', '$state', '$http','Semver',
            function ($log, $state, $http, Semver) {


                /**
                 *
                 * IMPORTANT!!
                 * Each key must have a respective .html file in /routes/partials
                 */
                var properties = {
                    '013': {
                        name: '',
                        hosts: '',
                        protocols: '',
                        methods: '',
                        paths: '',
                        strip_path: true,
                        preserve_host: false,
                        regex_priority: 0
                    }
                }

                return {

                    getProperties: function (version) {

                        var fver = version.split('.').slice(0, -1).join('');
                        var props = properties[fver] || properties[Object.keys(properties)[Object.keys(properties).length - 1]];

                        // Kong 0.11.x fix
                        if(Semver.cmp(version,"0.11.0") >= 0 && props.http_if_terminated !== undefined){
                            props.http_if_terminated = false;
                        }

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

                    update: function (route) {
                        return $http.patch('kong/routes/' + route.id, route)
                    },

                    delete: function (route) {
                        return $http.delete('kong/routes/' + route.id)
                    },

                    add: function (route) {
                        return $http.post('kong/routes/', route)
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
