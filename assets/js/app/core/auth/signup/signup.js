/**
 * Messages component which is divided to following logical components:
 *
 *  Controllers
 *
 * All of these are wrapped to 'frontend.auth.login' angular module.
 */
(function() {
  'use strict';

  // Define frontend.auth.login angular module
  angular.module('frontend.core.auth.signup', []);

  // Module configuration
  angular.module('frontend.core.auth.signup')
    .config([
      '$stateProvider',
      function config($stateProvider) {
        $stateProvider
          // Login
          .state('auth.signup', {
            url: '/signup',
            data: {
              access: 0,
              needsSignupEnabled : true
            },
            views: {
              'authContent': {
                templateUrl: 'js/app/core/auth/signup/signup.html',
                controller: 'SignupController'
              }
            }
          })
        ;
      }
    ])
    .controller('SignupController', [
          '$scope', '$state',
          'AuthService', 'FocusOnService','MessageService','UserModel',
          function controller(
              $scope, $state,
              AuthService, FocusOnService, MessageService, UserModel
          ) {


              $scope.showActivationMessage = false;

              $scope.signup = function() {
                  $scope.busy = true;
                  UserModel
                      .signup(angular.copy($scope.user))
                      .then(
                          function onSuccess(result) {
                              $scope.busy = false;

                              var credentials = {
                                  identifier: $scope.user.username,
                                  password: $scope.user.passports.password
                              };

                              // If user is activated automatically, sign him/her in.
                              if(result.data.active) {
                                  AuthService
                                      .login(credentials)
                                      .then(
                                          function successCallback() {
                                              $(".login-form-container").hide()
                                              $state.go('dashboard');
                                          },
                                          function errorCallback(err) {
                                              MessageService.error(err.data.message)
                                          }
                                      )
                              }else{
                                  $scope.showActivationMessage = true;
                              }

                          },function(err){
                              console.log(err)
                              $scope.busy = false
                              UserModel.handleError($scope,err)

                              var err = [];
                              Object.keys($scope.errors).forEach(function(key){
                                  err.push($scope.errors[key])
                              })

                              MessageService.error(err.join('<br>'))

                          }
                      )
                  ;
              }



              /**
               * Private helper function to reset credentials and set focus to username input.
               *
               * @private
               */
              function _reset() {
                  FocusOnService.focus('username');

                 $scope.user = {
                     username : '',
                     firstName : '',
                     lastName : '',
                     admin : false,
                     passports : {
                         password : '',
                         protocol : 'local'
                     },
                     password_confirmation : '',
                 }
              }

              _reset();
          }
      ])
  ;
}());
