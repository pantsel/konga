
(function() {
    'use strict';

    angular.module('frontend.admin.info', []);

    // Module configuration
    angular.module('frontend.admin.info')
        .config([
            '$stateProvider',
            function config($stateProvider) {
                $stateProvider
                    .state('admin.info', {
                        url: '/info',
                        data : {
                            pageName : "Node Info",
                            displayName : "node info",
                            prefix : '<i class="material-icons text-primary">&#xE88F;</i>'
                        },

                        views: {
                            'content@': {
                                templateUrl: '/frontend/admin/info/index.html',
                                controller: 'AdminInfoController',
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
