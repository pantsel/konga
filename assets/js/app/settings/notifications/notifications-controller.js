/**
 * This file contains all necessary Angular controller definitions for 'frontend.admin.login-history' module.
 *
 * Note that this file should only contain controllers and nothing else.
 */
(function() {
    'use strict';

    angular.module('frontend.settings')
        .controller('NotificationsController', [
            '_','$scope', '$rootScope','$log','EmailTransport','Settings','MessageService',
            function controller(_,$scope, $rootScope,$log,EmailTransport,Settings,MessageService) {


                $scope.updateKongaSettings = function() {
                    updateKongaSettings()
                }

                $scope.setDefaultTransport = function(name) {
                    $rootScope.konga_settings.default_transport = name;
                    updateKongaSettings()

                }

                function updateKongaSettings() {
                    Settings.update($rootScope.konga_settings_id,{
                            data : $rootScope.konga_settings
                        })
                        .then(function(settings){
                            $log.debug("Konga Settings updated",settings)
                            MessageService.success("Settings updated!")
                            //$rootScope.konga_settings = settings
                        }, function (error) {
                            $log.debug("Konga Settings failed to update",error)
                            MessageService.error("Failed to update settings!")
                        })
                }

                function _fetchEmailTransports() {
                    EmailTransport.load()
                        .then(function(transports){
                            $scope.transports = transports
                            $log.debug("NotificationsController:transports =>",$scope.transports)
                        })
                }


                _fetchEmailTransports()

            }
        ])
    ;
}());