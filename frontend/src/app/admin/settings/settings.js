
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

                                            return NodeModel.load(parameters);
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
