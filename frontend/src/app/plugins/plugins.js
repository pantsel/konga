
(function() {
    'use strict';

    angular.module('frontend.plugins', [
    ]);

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
            }
        ])
    ;
}());
