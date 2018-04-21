
(function() {
    'use strict';

    angular.module('frontend.routes', [
        'angular.chips',
        'ngFileUpload'
    ]);

    // Module configuration
    angular.module('frontend.routes')
        .config([
            '$stateProvider',
            function config($stateProvider) {
                $stateProvider
                    .state('routes', {
                        parent : 'frontend',
                        url: '/routes',
                        data : {
                            activeNode : true,
                            pageName : "Routes",
                            pageDescription : "The Route entities defines rules to match client requests. Each Route is associated with a Service, and a Service may have multiple Routes associated to it. Every request matching a given Route will be proxied to its associated Service.",
                            //displayName : "routes",
                            prefix : '<i class="material-icons">cloud_queue</i>'
                        },
                        views: {
                            'content@': {
                                templateUrl: 'js/app/routes/views/routes.html',
                                controller: 'RoutesController',
                            }
                        }
                    })
                    .state('routes.edit', {
                        url: '/:route_id/edit',
                        data : {
                            pageName : "Edit Route",
                            pageDescription : "",
                            displayName : "edit Route",
                            prefix : '<i class="mdi mdi-pencil"></i>'
                        },
                        views: {
                            'content@': {
                                templateUrl: 'js/app/routes/views/edit-route.html',
                                controller: 'RouteController',
                                resolve : {
                                    _route: [
                                        'RouteService','$stateParams',
                                        function resolve(RouteService,$stateParams) {
                                            return RouteService.findById($stateParams.route_id)
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
                            'details@routes.edit': {
                                templateUrl: 'js/app/routes/views/route-details.html',
                                controller: 'RouteDetailsController',
                            },
                            'plugins@routes.edit': {
                                templateUrl: 'js/app/routes/views/route-plugins.html',
                                controller: 'RoutePluginsController',
                                resolve : {
                                    _plugins : [
                                        'PluginsService','$stateParams',
                                        function(PluginsService,$stateParams) {
                                            return PluginsService.load({route_id : $stateParams.route_id})
                                        }
                                    ]
                                }
                            },
                            'healthchecks@routes.edit': {
                                templateUrl: 'js/app/routes/views/route-health-checks.html',
                                controller: 'RouteHealthChecksController',
                            }
                        }
                    })
                    .state('routes.plugins', {
                        url: '/:route_id/plugins',
                        params : {
                          route : {}
                        },
                        data : {
                            pageName : "Route Plugins",
                            displayName : "Route plugins"
                        },
                        views: {
                            'content@': {
                                templateUrl: 'js/app/routes/views/route-plugins.html',
                                controller: 'RoutePluginsController',
                                resolve : {
                                    _route : [
                                        'RouteService','$stateParams',
                                        function(RouteService, $stateParams) {
                                            return RouteService.findById($stateParams.route_id)
                                        }
                                    ],
                                    _plugins : [
                                        'PluginsService','$stateParams',
                                        function(PluginsService, $stateParams) {
                                            return PluginsService.load({
                                                route_id : $stateParams.route_id
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
                    .state('routes.plugins.manage', {
                        url: '/manage',
                        data : {
                            pageName : "Manage Route Plugins",
                            displayName : "manage"
                        },
                        views: {
                            'content@': {
                                templateUrl: 'js/app/routes/views/plugins/manage/manage-route-plugins.html',
                                controller: 'ManageRoutePluginsController',
                                resolve : {
                                    _route: [
                                        '$stateParams',
                                        'RouteService',
                                        '$log',
                                        function resolve(
                                            $stateParams,
                                            RouteService,
                                            $log
                                        ) {
                                            return RouteService.findById($stateParams.route_id)
                                        }
                                    ],
                                    _plugins: [
                                        '$stateParams',
                                        'RouteService',
                                        '$log',
                                        function resolve(
                                            $stateParams,
                                            RouteService,
                                            $log
                                        ) {
                                            return RouteService.plugins($stateParams.route_id)
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
