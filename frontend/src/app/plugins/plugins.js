
(function() {
    'use strict';

    angular.module('frontend.plugins', []);

    // Module configuration
    angular.module('frontend.plugins')
        .config([
            '$stateProvider',
            function config($stateProvider) {
                $stateProvider
                    .state('plugins', {
                        parent : 'frontend',
                        url: '/plugins',
                        data : {
                            activeNode : true,
                            pageName : "Plugins",
                            displayName : "plugins",
                            prefix : '<i class="material-icons text-primary">settings_input_component</i>'
                        },
                        views: {
                            'content@': {
                                templateUrl: '/frontend/plugins/plugins.html',
                                controller: 'PluginsController',
                                resolve: {
                                    _plugins : [
                                        'PluginsService',
                                        function(PluginsService) {
                                            return PluginsService.load()
                                        }
                                    ]
                                }
                            }
                        }
                    })
                    .state('plugins.add', {
                        url: '/add',
                        params : {
                            api : {}
                        },
                        data : {
                            pageName : "Add Global Plugins",
                            displayName : "add"
                        },
                        views: {
                            'content@': {
                                templateUrl: '/frontend/plugins/add-plugins.html',
                                controller: 'AddPluginsController',
                                resolve : {
                                    _plugins: [
                                        '$stateParams',
                                        'PluginsService',
                                        '$log',
                                        function resolve(
                                            $stateParams,
                                            PluginsService,
                                            $log
                                        ) {
                                            return PluginsService.load()
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
