
(function() {
    'use strict';

    angular.module('frontend.consumers', [
        'angular.chips',
        'ngMessages',
        'angularUtils.directives.dirPagination'
    ]);

    // Module configuration
    angular.module('frontend.consumers')
        .config([
            '$stateProvider',
            function config($stateProvider) {
                $stateProvider
                    .state('consumers', {
                        parent : 'frontend',
                        url: '/consumers',
                        data : {
                            activeNode : true,
                            pageName : "Consumers",
                            pageDescription : "The Consumer object represents a consumer - or a user - of an API. You can either rely on Kong as the primary datastore, or you can map the consumer list with your database to keep consistency between Kong and your existing primary datastore.",
                            //displayName : "consumers",
                            prefix : '<i class="material-icons">perm_identity</i>'
                        },

                        views: {
                            'content@': {
                                templateUrl: 'js/app/consumers/index.html',
                                controller: 'ConsumersController'
                            }
                        }
                    })
                    .state('consumers.edit', {
                        url: '/:id',
                        data : {
                            pageName : "Edit Consumer",
                            pageDescription : null,
                            displayName : "edit consumer",
                            prefix : '<i class="material-icons">perm_identity</i>'
                        },
                        views: {
                            'content@': {
                                templateUrl: 'js/app/consumers/edit-consumer.html',
                                controller: 'ConsumerController',

                            },
                            'details@consumers.edit': {
                                templateUrl: 'js/app/consumers/details/consumer-details.html',
                                controller: 'ConsumerDetailsController',
                            },
                            'groups@consumers.edit': {
                                templateUrl: 'js/app/consumers/groups/consumer-groups.html',
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
                            'credentials@consumers.edit': {
                                templateUrl: 'js/app/consumers/credentials/consumer-credentials.html',
                                controller: 'ConsumerCredentialsController',
                                resolve : {
                                    _keys : [
                                        'ConsumerService',
                                        '$stateParams',
                                        function(ConsumerService,$stateParams){
                                            return ConsumerService.loadCredentials($stateParams.id,'key-auth')
                                        }
                                    ],
                                    _jwts : [
                                        'ConsumerService',
                                        '$stateParams',
                                        function(ConsumerService,$stateParams){
                                            return ConsumerService.loadCredentials($stateParams.id,'jwt')
                                        }
                                    ],
                                    _basic_auth_credentials : [
                                        'ConsumerService',
                                        '$stateParams',
                                        function(ConsumerService,$stateParams){
                                            return ConsumerService.loadCredentials($stateParams.id,'basic-auth')
                                        }
                                    ],
                                    _oauth2_credentials : [
                                        'ConsumerService',
                                        '$stateParams',
                                        function(ConsumerService,$stateParams){
                                            return ConsumerService.loadCredentials($stateParams.id,'oauth2')
                                        }
                                    ],
                                    _hmac_auth_credentials : [
                                        'ConsumerService',
                                        '$stateParams',
                                        function(ConsumerService,$stateParams){
                                            return ConsumerService.loadCredentials($stateParams.id,'hmac-auth')
                                        }
                                    ]
                                }
                            },
                            'apis@consumers.edit': {
                                templateUrl: 'js/app/consumers/apis/consumer-apis.html',
                                controller: 'ConsumerApisController'
                            },
                            'plugins@consumers.edit': {
                                templateUrl: 'js/app/consumers/plugins/consumer-plugins.html',
                                controller: 'ConsumerPluginsController'
                            }
                        },
                        resolve : {
                            _consumer : [
                                'ConsumerService',
                                '$stateParams',
                                function(ConsumerService,$stateParams){
                                    return ConsumerService.findById($stateParams.id)
                                }
                            ],
                            _activeNode: [
                                'NodesService',
                                function resolve(NodesService) {
                                    return NodesService.isActiveNodeSet()
                                }
                            ],
                        },
                    })

            }
        ])
    ;
}());
