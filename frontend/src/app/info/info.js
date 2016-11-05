
(function() {
    'use strict';

    angular.module('frontend.info', []);

    // Module configuration
    angular.module('frontend.info')
        .config([
            '$stateProvider',
            function config($stateProvider) {
                $stateProvider
                    .state('info', {
                        parent: 'frontend',
                        url: '/info',
                        data : {
                            pageName : "Node Info",
                            displayName : "node info",
                            prefix : '<i class="material-icons text-primary">&#xE88F;</i>'
                        },

                        views: {
                            'content@': {
                                templateUrl: '/frontend/info/index.html',
                                controller: 'InfoController',
                                resolve : {
                                    _info : ['InfoService',function(InfoService) {
                                        return InfoService.getInfo()
                                    }],
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
                ;
            }
        ])
    ;
}());
