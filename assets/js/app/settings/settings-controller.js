/**
 * This file contains all necessary Angular controller definitions for 'frontend.admin.login-history' module.
 *
 * Note that this file should only contain controllers and nothing else.
 */
(function() {
    'use strict';

    angular.module('frontend.settings')
        .controller('SettingsController', [
            '_','$scope', '$rootScope','$q','$log','$ngBootbox','UserModel',
            'SocketHelperService','UserService','SettingsService','MessageService',
            '$state','$uibModal','DialogService','NodeModel','$localStorage',
            'ListConfig',
            function controller(_,$scope, $rootScope,$q,$log,$ngBootbox,UserModel,
                                SocketHelperService, UserService,SettingsService, MessageService,
                                $state, $uibModal,DialogService,NodeModel,$localStorage,
                                ListConfig ) {




            }
        ])
    ;
}());