
(function() {
    'use strict';

    angular.module('frontend.upstreams', [
    ]);

    // Module configuration
    angular.module('frontend.upstreams')
        .config([
            '$stateProvider',
            function config($stateProvider) {
                $stateProvider
                    .state('upstreams', {
                        url: '/upstreams',
                        parent : 'frontend',
                        data : {
                            access : 1,
                            pageName : "Upstreams",
                            pageDescription : "The upstream object represents a virtual hostname and can be used to loadbalance incoming requests over multiple services (targets). So for example an upstream named <code>service.v1.xyz</code> with an API object created with an <code>upstream_url=https://service.v1.xyz/some/path</code>. Requests for this API would be proxied to the targets defined within the upstream.",
                            displayName : "upstreams",
                            prefix : '<i class="material-icons">&#xE8F2;</i>'
                        },
                        views: {
                            'content@': {
                                templateUrl : 'js/app/upstreams/index.html',
                                controller  : 'UpstreamsController'
                            }
                        }
                    })
            }
        ])
    ;
}());
