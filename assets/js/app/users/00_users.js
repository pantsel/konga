
(function() {
    'use strict';

    angular.module('frontend.users', [
    ]);

    // Module configuration
    angular.module('frontend.users')
        .config([
            '$stateProvider',
            function config($stateProvider) {
                $stateProvider
                    .state('users', {
                        url: '/users',
                        parent : 'frontend',
                        cache : false,
                        data : {
                            pageName : "Konga Users",
                            displayName : "konga users",
                            prefix : '<i class="material-icons">&#xE7FC;</i>'
                        },
                        views: {
                            'content@': {
                                templateUrl: 'js/app/users/index.html',
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
                    .state('users.create', {
                        url: '/create',
                        data : {
                            pageName : "Create Konga user",
                            displayName : "create",
                            prefix : '<i class="material-icons">&#xE55A;</i>'
                        },
                        views: {
                            'content@': {
                                templateUrl: 'js/app/users/user-create.html',
                                controller: 'UserCreateController'
                            }
                        }
                    })
                    .state('users.show', {
                        url: '/:id',
                        data : {
                            pageName : "User profile",
                            displayName : "profile",
                            prefix : '<i class="material-icons">&#xE55A;</i>'
                        },
                        views: {
                            'content@': {
                                templateUrl: 'js/app/users/user.html',
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
