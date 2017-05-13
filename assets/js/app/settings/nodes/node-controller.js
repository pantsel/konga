/**
 * This file contains all necessary Angular controller definitions for 'frontend.admin.login-history' module.
 *
 * Note that this file should only contain controllers and nothing else.
 */
(function() {
    'use strict';

    angular.module('frontend.settings')
        .controller('NodeController', [
            '_','$scope', '$rootScope','$log','_node',
            function controller(_,$scope, $rootScope,$log,_node ) {

                $scope.node = _node;
                $scope.transports = [
                    {
                        "name" : "smtp",
                        "description" : "Send emails using the SMTP protocol",
                        "settings" : {
                            host : '',
                            port : '',
                            auth: {
                                user: '',
                                pass: ''
                            }
                        }
                    },
                    {
                        "name" : "sendmail",
                        "description" : "Pipe messages to the sendmail command"
                    },
                    {
                        name : "Mailgun",
                        "description" : "Send emails through Mailgun’s Web API",
                        "settings" : {
                            auth: {
                                api_key: '',
                                domain: ''
                            }
                        }
                    }
                ]
            }
        ])
    ;
}());