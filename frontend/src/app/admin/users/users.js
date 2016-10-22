
(function() {
    'use strict';

    angular.module('frontend.admin.users', [
    ]);

    // Module configuration
    angular.module('frontend.admin.users')
        .config([
            '$stateProvider',
            function config($stateProvider) {
                $stateProvider
                    .state('admin.users', {
                        url: '/users',
                        cache : false,
                        data : {
                            pageName : "Konga Users",
                            displayName : "konga users",
                            prefix : '<i class="material-icons">&#xE7FC;</i>'
                        },
                        views: {
                            'content@': {
                                templateUrl: '/frontend/admin/users/index.html',
                                controller: 'UsersController',
                                resolve: {
                                    _items: [
                                        'ListConfig',
                                        'UserModel',
                                        function resolve(
                                            ListConfig,
                                            UserModel
                                        ) {
                                            var config = ListConfig.getConfig();

                                            var parameters = {
                                                limit: config.itemsPerPage,
                                                sort: 'createdAt DESC'
                                            };

                                            return UserModel.load(parameters);
                                        }
                                    ],
                                    _count: [
                                        'UserModel',
                                        function resolve(UserModel) {
                                            return UserModel.count();
                                        }
                                    ]
                                }
                            }
                        }
                    })
                    .state('admin.users.create', {
                        url: '/create',
                        data : {
                            pageName : "Create Konga user",
                            displayName : "create",
                            prefix : '<i class="material-icons">&#xE55A;</i>'
                        },
                        views: {
                            'content@': {
                                templateUrl: '/frontend/admin/users/user-create.html',
                                controller: 'UserCreateController'
                            }
                        }
                    })
                    .state('admin.users.show', {
                        url: '/:id',
                        data : {
                            pageName : "User profile",
                            displayName : "profile",
                            prefix : '<i class="material-icons">&#xE55A;</i>'
                        },
                        views: {
                            'content@': {
                                templateUrl: '/frontend/admin/users/user.html',
                                controller: 'UserController',
                                resolve: {
                                    _user: [
                                        '$stateParams',
                                        'UserModel',
                                        function resolve(
                                            $stateParams,
                                            UserModel
                                        ) {
                                            return UserModel.fetch($stateParams.id);
                                        }
                                    ],
                                }
                            }
                        }
                    })
            }
        ])
    ;
}());
