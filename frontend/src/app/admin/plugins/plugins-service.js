/**
 * This file contains all necessary Angular controller definitions for 'frontend.admin.login-history' module.
 *
 * Note that this file should only contain controllers and nothing else.
 */
(function() {
    'use strict';

    angular.module('frontend.admin.apis')
        .service('PluginService', [
            '$log', '$state','$http','BackendConfig',
            function( $log, $state, $http,BackendConfig) {

                return {

                    addPlugin : function(apiId,plugin) {
                        for(var key in plugin) {
                            if(!plugin[key] || plugin[key] == '') delete plugin[key]
                        }

                        if(apiId) {
                            return $http.post(BackendConfig.url + '/kong/apis/' + apiId + '/plugins',plugin)
                        }

                        return $http.post(BackendConfig.url + '/kong/plugins',plugin)

                    },
                }
            }
        ])
    ;
}());
