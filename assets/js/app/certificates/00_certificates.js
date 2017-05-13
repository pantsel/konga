
(function() {
    'use strict';

    angular.module('frontend.certificates', []);

    // Module configuration
    angular.module('frontend.certificates')
        .config([
            '$stateProvider',
            function config($stateProvider) {
                $stateProvider
                    .state('certificates', {
                        parent : 'frontend',
                        url: '/certificates',
                        data : {
                            activeNode : true,
                            pageName : "Certificates",
                            pageDescription : "A certificate object represents a public certificate/private key pair for an SSL certificate. These objects are used by Kong to handle SSL/TLS termination for encrypted requests. Certificates are optionally associated with SNI objects to tie a cert/key pair to one or more hostnames.",
                            //displayName : "certificates",
                            prefix : '<i class="material-icons text-primary">perm_identity</i>'
                        },
                        views: {
                            'content@': {
                                templateUrl: 'js/app/certificates/certificates.html',
                                controller: 'CertificatesController',
                                //resolve: {
                                //    _certificates : [
                                //        'PluginsService',
                                //        function(PluginsService) {
                                //            return PluginsService.load()
                                //        }
                                //    ]
                                //}
                            }
                        }
                    })
            }
        ])
    ;
}());
