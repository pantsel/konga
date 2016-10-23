
(function() {
    'use strict';

    angular.module('frontend.admin.apis', [
        'angular.chips'
    ]);

    // Module configuration
    angular.module('frontend.admin.apis')
        .config([
            '$stateProvider',
            function config($stateProvider) {
                $stateProvider
                    .state('admin.apis', {
                        url: '/apis',
                        data : {
                            pageName : "Apis",
                            displayName : "apis",
                            prefix : '<i class="material-icons text-warning">cloud_queue</i>'
                        },
                        views: {
                            'content@': {
                                templateUrl: '/frontend/admin/apis/index.html',
                                controller: 'AdminApisController',
                                resolve : {
                                    _info : ['InfoService',function(InfoService) {
                                        return InfoService.getInfo()
                                    }],
                                }
                            }
                        }
                    })
                    .state('admin.apis.plugins', {
                        url: '/:apiId/plugins',
                        params : {
                          api : {}
                        },
                        data : {
                            pageName : "Apis : Plugins",
                            displayName : "plugins"
                        },
                        views: {
                            'content@': {
                                templateUrl: '/frontend/admin/apis/plugins/plugins.html',
                                controller: 'AdminApisPluginsController',
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
                                            return ApiService.findById($stateParams.apiId)
                                        }
                                    ]
                                }
                            }
                        },
                    })
                    .state('admin.apis.plugins.manage', {
                        url: '/manage',
                        params : {
                            api : {}
                        },
                        data : {
                            pageName : "Add Plugin",
                            displayName : "manage"
                        },
                        views: {
                            'content@': {
                                templateUrl: '/frontend/admin/apis/plugins/manage/manage-api-plugins.html',
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
                                            return ApiService.findById($stateParams.apiId)
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
                                            return ApiService.plugins($stateParams.apiId)
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
                                    ]
                                }
                            }
                        },
                    })
            }
        ])
    ;
}());
