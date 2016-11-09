
(function() {
    'use strict';

    angular.module('frontend.apis', [
        'angular.chips',
        'ngFileUpload'
    ]);

    // Module configuration
    angular.module('frontend.apis')
        .config([
            '$stateProvider',
            function config($stateProvider) {
                $stateProvider
                    .state('apis', {
                        parent : 'frontend',
                        url: '/apis',
                        data : {
                            pageName : "APIs",
                            displayName : "apis",
                            prefix : '<i class="material-icons">cloud_queue</i>'
                        },
                        views: {
                            'content@': {
                                templateUrl: '/frontend/apis/apis.html',
                                controller: 'ApisController',
                                resolve : {
                                    _apis: [
                                        'ApiService',
                                        function resolve(ApiService) {
                                            return ApiService.all()
                                        }
                                    ],
                                    _activeNode: [
                                        'NodesService',
                                        function resolve(NodesService) {
                                            return NodesService.isActiveNodeSet()
                                        }
                                    ],
                                }
                            }
                        }
                    })
                    .state('apis.edit', {
                        url: '/:api_id/edit',
                        data : {
                            pageName : "Edit API",
                            displayName : "edit",
                            prefix : '<i class="material-icons">edit</i>'
                        },
                        views: {
                            'content@': {
                                templateUrl: '/frontend/apis/edit-api.html',
                                controller: 'ApiController',
                                resolve : {
                                    _api: [
                                        'ApiService','$stateParams',
                                        function resolve(ApiService,$stateParams) {
                                            return ApiService.findById($stateParams.api_id)
                                        }
                                    ],
                                    _activeNode: [
                                        'NodesService',
                                        function resolve(NodesService) {
                                            return NodesService.isActiveNodeSet()
                                        }
                                    ],
                                }

                            },
                            'details@apis.edit': {
                                templateUrl: '/frontend/apis/api-details.html',
                                controller: 'ApiDetailsController',
                            },
                            'plugins@apis.edit': {
                                templateUrl: '/frontend/apis/api-plugins.html',
                                controller: 'ApiPluginsController',
                                resolve : {
                                    _plugins : [
                                        'PluginsService','$stateParams',
                                        function(PluginsService,$stateParams) {
                                            return PluginsService.load({api_id : $stateParams.api_id})
                                        }
                                    ]
                                }
                            }
                        }
                    })
                    .state('apis.plugins', {
                        url: '/:api_id/plugins',
                        params : {
                          api : {}
                        },
                        data : {
                            pageName : "API Plugins",
                            displayName : "API plugins"
                        },
                        views: {
                            'content@': {
                                templateUrl: '/frontend/apis/api-plugins.html',
                                controller: 'ApiPluginsController',
                                resolve : {
                                    _api : [
                                        'ApiService','$stateParams',
                                        function(ApiService, $stateParams) {
                                            return ApiService.findById($stateParams.api_id)
                                        }
                                    ],
                                    _plugins : [
                                        'PluginsService','$stateParams',
                                        function(PluginsService, $stateParams) {
                                            return PluginsService.load({
                                                api_id : $stateParams.api_id
                                            })
                                        }
                                    ],
                                    _activeNode: [
                                        'NodesService',
                                        function resolve(NodesService) {

                                            return NodesService.isActiveNodeSet()
                                        }
                                    ],
                                }
                            }
                        },
                    })
                    .state('apis.plugins.manage', {
                        url: '/manage',
                        data : {
                            pageName : "Manage API Plugins",
                            displayName : "manage"
                        },
                        views: {
                            'content@': {
                                templateUrl: '/frontend/apis/plugins/manage/manage-api-plugins.html',
                                controller: 'ManageApiPluginsController',
                                resolve : {
                                    _api: [
                                        '$stateParams',
                                        'ApiService',
                                        '$log',
                                        function resolve(
                                            $stateParams,
                                            ApiService,
                                            $log
                                        ) {
                                            return ApiService.findById($stateParams.api_id)
                                        }
                                    ],
                                    _plugins: [
                                        '$stateParams',
                                        'ApiService',
                                        '$log',
                                        function resolve(
                                            $stateParams,
                                            ApiService,
                                            $log
                                        ) {
                                            return ApiService.plugins($stateParams.api_id)
                                        }
                                    ],
                                    _info: [
                                        '$stateParams',
                                        'InfoService',
                                        '$log',
                                        function resolve(
                                            $stateParams,
                                            InfoService,
                                            $log
                                        ) {
                                            return InfoService.getInfo()
                                        }
                                    ],
                                    _activeNode: [
                                        'NodesService',
                                        function resolve(NodesService) {

                                            return NodesService.isActiveNodeSet()
                                        }
                                    ],
                                }
                            }
                        },
                    })
            }
        ])
    ;
}());
