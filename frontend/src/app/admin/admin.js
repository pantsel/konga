/**
 * Angular module for admin component. All of these are wrapped to 'frontend.admin.login-history' angular module. This
 * component is divided to following logical components:
 *
 *  frontend.admin.login-history
 *
 * Also this file contains all necessary information about 'frontend.admin' module route definitions.
 */
(function() {
  'use strict';

  // Define frontend.admin module
  angular.module('frontend.admin', [
    'frontend.admin',
    'frontend.admin.info',
    'frontend.admin.apis',
    'frontend.admin.consumers',
    'frontend.admin.users',
    'frontend.admin.settings',
    'ui.bootstrap.modal',
    'ui.bootstrap.pagination',
  ]);

  // Module configuration
  angular.module('frontend.admin')
    .config([
      '$stateProvider',
      function config($stateProvider) {
        $stateProvider
          .state('admin', {
            parent: 'frontend',
            url: '/admin',
            data: {
                access: 1,
                pageName : "Admin",
                displayName : "admin"
            },
            views: {
                'content@': {
                    templateUrl: '/frontend/admin/index.html',
                    controller: 'AdminController',
                    resolve: {
                        //_info : ['InfoService',function(InfoService) {
                        //    return  InfoService.getInfo()
                        //}]
                        _nodes: [
                            'ListConfig',
                            'NodeModel',
                            function resolve(
                                ListConfig,
                                NodeModel
                            ) {
                                var config = ListConfig.getConfig();

                                var parameters = {
                                    limit: config.itemsPerPage,
                                    sort: 'createdAt DESC'
                                };

                                return NodeModel.load(_.merge({}, {
                                    active:true
                                }, parameters));
                            }
                        ],
                    }
                }
            }
          })
        ;
      }
    ])
  ;
}());
