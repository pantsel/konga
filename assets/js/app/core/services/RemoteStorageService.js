/**
 * Simple service to activate noty2 message to GUI. This service can be used every where in application. Generally
 * all $http and $socket queries uses this service to show specified errors to user.
 *
 * Service can be used as in following examples (assuming that you have inject this service to your controller):
 *  Message.success(message, [title], [options]);
 *  Message.error(message, [title], [options]);
 *  Message.message(message, [title], [options]);
 *
 * Feel free to be happy and code some awesome stuff!
 *
 * @todo do we need some queue dismiss?
 */
(function() {
    'use strict';

    angular.module('frontend.core.services')
        .factory('RemoteStorageService', [
            '$log', '$state','$http','BackendConfig',
            function factory($log, $state, $http,BackendConfig) {
                return {

                    loadAdapters : function() {
                        return $http({
                            url : BackendConfig.url + '/remote/adapters/',
                            method: "GET"
                        })
                    },

                    testConnection : function(query) {
                        return $http({
                            url : BackendConfig.url + '/remote/connection/test',
                            method: "GET",
                            params : query
                        })
                    },

                    fetchConsumers : function(data) {
                        return $http.post(BackendConfig.url + '/remote/consumers',data)
                    },
                }
            }
        ])
    ;
}());
