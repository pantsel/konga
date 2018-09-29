/**
 * Messages component which is divided to following logical components:
 *
 *  Controllers
 *
 * All of these are wrapped to 'frontend.auth.login' angular module.
 */
(function () {
    'use strict';

    // Define frontend.auth.login angular module
    angular.module('frontend.core.auth.login', []);

    // Module configuration
    angular.module('frontend.core.auth.login')
        .config([
            '$stateProvider',
            function config($stateProvider) {
                $stateProvider
                    // Login
                    .state('auth.login', {
                        url: '/login?activated',
                        data: {
                            access: 0
                        },
                        params: {
                            activated: null
                        },
                        views: {
                            'authContent': {
                                templateUrl: 'js/app/core/auth/login/login.html',
                                controller: 'LoginController'
                            },

                        }
                    })
                ;
            }
        ])
        .controller('LoginController', [
            '$scope', '$state', '$stateParams',
            'AuthService', 'FocusOnService', 'MessageService',
            function controller($scope, $state, $stateParams,
                                AuthService, FocusOnService, MessageService) {


                // Scope function to perform actual login request to server
                $scope.login = function login() {
                    $scope.busy = true;
                    AuthService
                        .login($scope.credentials)
                        .then(
                            function successCallback() {
                                $(".login-form-container").remove();
                                $state.go('dashboard');
                                $scope.busy = false;
                            },
                            function errorCallback(err) {
                                $scope.busy = false;
                            }
                        )
                    ;
                };

                /**
                 * Private helper function to reset credentials and set focus to username input.
                 *
                 * @private
                 */
                function _reset() {
                    FocusOnService.focus('username');

                    // Initialize credentials
                    $scope.credentials = {
                        identifier: '',
                        password: ''
                    };
                }

                _reset();
            }
        ])
    ;
}());
