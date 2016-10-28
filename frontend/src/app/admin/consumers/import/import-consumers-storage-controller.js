/**
 * This file contains all necessary Angular controller definitions for 'frontend.admin.login-history' module.
 *
 * Note that this file should only contain controllers and nothing else.
 */
(function() {
    'use strict';

    angular.module('frontend.admin.consumers')
        .controller('ImportConsumersStorageController', [
            '_','$scope', '$log', '$state','ConsumerService','$uibModal','$uibModalInstance',
            function controller(_,$scope, $log, $state, ConsumerService, $uibModal, $uibModalInstance) {

                $scope.close = function() {
                    $uibModalInstance.dismiss()
                }
                $scope.adapters = {
                    'mysql' : {
                        name : 'MySQL',
                        value : 'mysql',
                        description : 'Import Consumers from a MySQL database table',
                        form_fields : {
                            connection : {
                                host : {
                                    name : 'host',
                                    type : 'text',
                                    description : 'The database host. Defaults to localhost'
                                },
                                user : {
                                    name : 'user',
                                    type : 'text',
                                    description : 'The database user. Defaults to root'
                                },
                                password : {
                                    name : 'password',
                                    type : 'text',
                                    description : 'The database user\'s password.'
                                },
                                database : {
                                    name : 'database',
                                    type : 'text',
                                    required : true,
                                    description : 'The database to connect to.'
                                },
                            },
                            consumer : {
                                table : {
                                    name : 'table',
                                    type : 'text',
                                    required : true,
                                    description : 'The table containing the consumers that will be imported to Kong.'
                                }
                            }


                        }
                    },
                    "sql" : {
                        name : 'SQL',
                        value : 'sql',
                        description : 'Import Consumers from an SQL database table'
                    },
                    "mongodb" : {
                        name : 'MongoDB',
                        value : 'mongodb',
                        description : 'Import Consumers from a MongoDB collection'
                    }
                }

                $scope.onStorageSelected = function(adapter) {
                    $uibModal.open({
                        animation: true,
                        ariaLabelledBy: 'modal-title',
                        ariaDescribedBy: 'modal-body',
                        templateUrl: '/frontend/admin/consumers/import/modal-connection-options.html',
                        controller: 'ImportConsumersConnectionController',
                        size: 'lg',
                        controllerAs: '$ctrl',
                        resolve : {
                            _adapter : function() {
                                return $scope.adapters[adapter]
                            }
                        }
                    });
                }

            }
        ])
}());
