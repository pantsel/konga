
(function() {
    'use strict';

    angular.module('frontend.admin.consumers', [
        'angular.chips',
    ]);

    // Module configuration
    angular.module('frontend.admin.consumers')
        .config([
            '$stateProvider',
            function config($stateProvider) {
                $stateProvider
                    .state('admin.consumers', {
                        url: '/consumers',
                        data : {
                            pageName : "Consumers",
                            displayName : "consumers",
                            prefix : '<i class="material-icons text-success">perm_identity</i>'
                        },

                        views: {
                            'content@': {
                                templateUrl: '/frontend/admin/consumers/index.html',
                                controller: 'ConsumersController',
                                resolve : {
                                    _consumers : [
                                        'ConsumerService',function(ConsumerService){
                                            return ConsumerService.query()
                                        }
                                    ]
                                }
                            }
                        }
                    })
                    .state('admin.consumers.edit', {
                        url: '/:id',
                        data : {
                            pageName : "Edit Consumer",
                            displayName : "edit consumer",
                            prefix : '<i class="material-icons text-success">perm_identity</i>'
                        },
                        views: {
                            'content@': {
                                templateUrl: '/frontend/admin/consumers/edit-consumer.html',
                                controller: 'ConsumerController',

                            },
                            'details@admin.consumers.edit': {
                                templateUrl: '/frontend/admin/consumers/details/consumer-details.html',
                                controller: 'ConsumerDetailsController',
                            },
                            'groups@admin.consumers.edit': {
                                templateUrl: '/frontend/admin/consumers/groups/consumer-groups.html',
                                controller: 'ConsumerGroupsController',
                                resolve : {
                                    _acls : [
                                        'ConsumerService',
                                        '$stateParams',
                                        function(ConsumerService,$stateParams){
                                            return ConsumerService.fetchAcls($stateParams.id)
                                        }
                                    ],
                                }
                            },
                            'credentials@admin.consumers.edit': {
                                templateUrl: '/frontend/admin/consumers/credentials/consumer-credentials.html',
                                controller: 'ConsumerCredentialsController',
                                resolve : {
                                    _keys : [
                                        'ConsumerService',
                                        '$stateParams',
                                        function(ConsumerService,$stateParams){
                                            return ConsumerService.fetchKeys($stateParams.id)
                                        }
                                    ],
                                    _jwts : [
                                        'ConsumerService',
                                        '$stateParams',
                                        function(ConsumerService,$stateParams){
                                            return ConsumerService.fetchJWTs($stateParams.id)
                                        }
                                    ],
                                    _basic_auth_credentials : [
                                        'ConsumerService',
                                        '$stateParams',
                                        function(ConsumerService,$stateParams){
                                            return ConsumerService.fetchBasicAuthCredentials($stateParams.id)
                                        }
                                    ],
                                    _hmac_auth_credentials : [
                                        'ConsumerService',
                                        '$stateParams',
                                        function(ConsumerService,$stateParams){
                                            return ConsumerService.fetchHMACAuthCredentials($stateParams.id)
                                        }
                                    ]
                                }
                            }
                        },
                        resolve : {
                            _consumer : [
                                'ConsumerService',
                                '$stateParams',
                                function(ConsumerService,$stateParams){
                                    return ConsumerService.findById($stateParams.id)
                                }
                            ]
                        },
                    })

            }
        ])
    ;
}());
