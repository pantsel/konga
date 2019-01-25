(function () {
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
            parent: 'frontend',
            url: '/routes',
            data: {
              activeNode: true,
              pageName: "Routes",
              pageDescription: "" +
              "The Route entities defines rules to match client requests. Each Route is associated with a Service, and a Service may have multiple Routes associated to it. Every request matching a given Route will be proxied to its associated Service.",
              //displayName : "routes",
              prefix: '<i class="material-icons">cloud_queue</i>'
            },
            views: {
              'content@': {
                templateUrl: 'js/app/routes/views/routes.html',
                controller: 'RoutesController',
                resolve:{
                  _services: [
                    'ServiceModel', 'ListConfig', function resolve(ServiceModel, ListConfig) {
                      return ServiceModel.load({
                        size : ListConfig.defaultLimit
                      })
                    }
                  ]
                }
              }
            }
          })
          .state('routes.read', {
            url: '/:route_id/read',
            data: {
              pageName: "Route",
              pageDescription: "",
              displayName: "route",
              prefix: '<i class="mdi mdi-pencil"></i>'
            },
            views: {
              'content@': {
                templateUrl: 'js/app/routes/views/edit-route.html',
                controller: 'RouteController',
                resolve: {
                  _route: [
                    'RoutesService', '$stateParams',
                    function resolve(RoutesService, $stateParams) {
                      return RoutesService.findById($stateParams.route_id)
                    }
                  ],
                  _gateway: [
                    'InfoService',
                    '$rootScope',
                    function (InfoService, $rootScope) {
                      return new Promise((resolve, reject) => {
                        var watcher = $rootScope.$watch('Gateway', function (newValue, oldValue) {
                          if (newValue) {
                            watcher(); // clear watcher
                            resolve(newValue)
                          }
                        })
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

              },
              'details@routes.read': {
                templateUrl: 'js/app/routes/views/route-details.html',
                controller: 'RouteDetailsController',
                resolve: {
                  _route: [
                    'RoutesService', '$stateParams',
                    function resolve(RoutesService, $stateParams) {
                      return RoutesService.findById($stateParams.route_id)
                    }
                  ]
                }
              },
              'plugins@routes.read': {
                templateUrl: 'js/app/routes/views/route-plugins.html',
                controller: 'RoutePluginsController'
              },
              'consumers@routes.read': {
                templateUrl: 'js/app/routes/views/route-consumers.html',
                controller: 'RouteConsumersController'
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
                            'RoutesService','$stateParams',
                            function(RoutesService, $stateParams) {
                                return RoutesService.findById($stateParams.route_id)
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
                            'RoutesService',
                            '$log',
                            function resolve(
                                $stateParams,
                                RoutesService,
                                $log
                            ) {
                                return RoutesService.findById($stateParams.route_id)
                            }
                        ],
                        _plugins: [
                            '$stateParams',
                            'RoutesService',
                            '$log',
                            function resolve(
                                $stateParams,
                                RoutesService,
                                $log
                            ) {
                                return RoutesService.plugins($stateParams.route_id)
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
