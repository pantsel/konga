(function () {
  'use strict';

  angular.module('frontend.services', [
    'angular.chips',
    'ngFileUpload'
  ]);

  // Module configuration
  angular.module('frontend.services')
    .config([
      '$stateProvider',
      function config($stateProvider) {
        $stateProvider
          .state('services', {
            parent: 'frontend',
            url: '/services',
            data: {
              activeNode: true,
              pageName: "Services",
              pageDescription: "Service entities, as the name implies, are abstractions of each of your own upstream services. Examples of Services would be a data transformation microservice, a billing API, etc.",
              //displayName : "services",
              prefix: '<i class="material-icons">cloud_queue</i>'
            },
            views: {
              'content@': {
                templateUrl: 'js/app/services/views/services.html',
                controller: 'ServicesController',
              }
            }
          })
          .state('services.read', {
            url: '/:service_id/read',
            data: {
              pageName: "Show Service",
              pageDescription: "",
              displayName: "show",
              prefix: '<i class="mdi mdi-pencil"></i>'
            },
            views: {
              'content@': {
                templateUrl: 'js/app/services/views/edit-service.html',
                controller: 'ServiceController',
                resolve: {
                  _service: [
                    'ServiceService', '$stateParams',
                    function resolve(ServiceService, $stateParams) {
                      return ServiceService.findById($stateParams.service_id);
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
                      return NodesService.isActiveNodeSet();
                    }
                  ],
                }

              },
              'details@services.read': {
                templateUrl: 'js/app/services/views/service-details.html',
                controller: 'ServiceDetailsController',
              },
              'routes@services.read': {
                templateUrl: 'js/app/services/views/service-routes.html',
                controller: 'ServiceRoutesController'
              },
              'consumers@services.read': {
                templateUrl: 'js/app/services/views/service-consumers.html',
                controller: 'ServiceConsumersController'
              },
              'plugins@services.read': {
                templateUrl: 'js/app/services/views/service-plugins.html',
                controller: 'ServicePluginsController',
                // resolve: {
                //   _plugins: [
                //     'PluginsService', '$stateParams',
                //     function (PluginsService, $stateParams) {
                //       return PluginsService.load({service_id: $stateParams.service_id})
                //     }
                //   ]
                // }
              },
              'healthchecks@services.read': {
                templateUrl: 'js/app/services/views/service-health-checks.html',
                controller: 'ServiceHealthChecksController',
              }
            }
          })
          .state('services.plugins', {
            url: '/:service_id/plugins',
            params: {
              service: {}
            },
            data: {
              pageName: "Service Plugins",
              displayName: "Service plugins"
            },
            views: {
              'content@': {
                templateUrl: 'js/app/services/views/service-plugins.html',
                controller: 'ServicePluginsController',
                resolve: {
                  _service: [
                    'ServiceService', '$stateParams',
                    function (ServiceService, $stateParams) {
                      return ServiceService.findById($stateParams.service_id)
                    }
                  ],
                  _plugins: [
                    'PluginsService', '$stateParams',
                    function (PluginsService, $stateParams) {
                      return PluginsService.load({
                        service_id: $stateParams.service_id
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
          .state('services.plugins.manage', {
            url: '/manage',
            data: {
              pageName: "Manage Service Plugins",
              displayName: "manage"
            },
            views: {
              'content@': {
                templateUrl: 'js/app/services/views/plugins/manage/manage-service-plugins.html',
                controller: 'ManageServicePluginsController',
                resolve: {
                  _service: [
                    '$stateParams',
                    'ServiceService',
                    '$log',
                    function resolve(
                      $stateParams,
                      ServiceService,
                      $log
                    ) {
                      return ServiceService.findById($stateParams.service_id)
                    }
                  ],
                  _plugins: [
                    '$stateParams',
                    'ServiceService',
                    '$log',
                    function resolve(
                      $stateParams,
                      ServiceService,
                      $log
                    ) {
                      return ServiceService.plugins($stateParams.service_id)
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
