/**
 * This file contains all necessary Angular controller definitions for 'frontend.admin.login-history' module.
 *
 * Note that this file should only contain controllers and nothing else.
 */
(function() {
    'use strict';

    angular.module('frontend.settings')
        .service('SettingsService', [
            '$localStorage',
            function($localStorage ) {

                var defSettings = {
                    kong_version : "0-9-x"
                }

                return {
                    setSettings : function(settings) {
                        console.log("########",settings)
                        $localStorage.settings = settings
                    },
                    getSettings : function() {
                        return $localStorage.settings || defSettings
                    }
                }


            }
        ])
    ;
}());