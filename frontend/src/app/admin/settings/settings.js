
(function() {
    'use strict';

    angular.module('frontend.admin.settings', [
    ]);

    // Module configuration
    angular.module('frontend.admin.settings')
        .config([
            '$stateProvider',
            function config($stateProvider) {
                $stateProvider
                    .state('admin.settings', {
                        url: '/settings',
                        data : {
                            pageName : "Konga Settings",
                            displayName : "settings",
                            prefix : '<i class="material-icons">&#xE8B8;</i>'
                        },
                        views: {
                            'content@': {
                                templateUrl: '/frontend/admin/settings/index.html',
                                controller: 'SettingsController',
                                resolve: {
                                    _nodes: [
                                        '_',
                                        'ListConfig','SocketHelperService',
                                        'NodeModel',
                                        function resolve(
                                            _,
                                            ListConfig,SocketHelperService,
                                            NodeModel
                                        ) {
                                            var config = ListConfig.getConfig();
                                            var commonParameters = {
                                                where: SocketHelperService.getWhere({
                                                    searchWord: ''
                                                })
                                            };

                                            var parameters = {
                                                limit: config.itemsPerPage,
                                                sort: 'createdAt DESC'
                                            };

                                            return NodeModel.load(_.merge({}, commonParameters, parameters));
                                        }
                                    ],
                                    _countNodes: [
                                        'NodeModel',
                                        function resolve(NodeModel) {
                                            return NodeModel.count();
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
