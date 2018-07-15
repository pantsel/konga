
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
                            activeNode : true,
                            pageName : "Node Info",
                            access: 2, // Only admins can access this route
                            // displayName : "node info",
                            pageDescription : "Generic details about the node",
                            prefix : '<i class="material-icons text-primary">&#xE88F;</i>'
                        },

                        views: {
                            'content@': {
                                templateUrl: 'js/app/info/index.html',
                                controller: 'InfoController'
                            }
                        },

                    })
                ;
            }
        ])
    ;
}());
