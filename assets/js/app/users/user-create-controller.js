/**
 * This file contains all necessary Angular controller definitions for 'frontend.admin.login-history' module.
 *
 * Note that this file should only contain controllers and nothing else.
 */
(function() {
  'use strict';

  angular.module('frontend.users')
    .controller('UserCreateController', [
      '_','$scope','$q','$log','UserService','MessageService','$state','DialogService','UserModel',
      function controller(_,$scope,$q,$log, UserService, MessageService,$state,DialogService,UserModel ) {

          // Initialize author model
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

          /**
           * Scope function to store new author to database. After successfully save user will be redirected
           * to view that new created author.
           */
          $scope.createUser = function createUser() {
              $scope.busy = true;
              UserModel
                  .signup(angular.copy($scope.user))
                  .then(
                      function onSuccess(result) {
                          MessageService.success('New user created successfully');
                          $scope.busy = false;
                          $state.go('users.show', {id: result.data.id});
                      },function(err){
                          $scope.busy = false
                          UserModel.handleError($scope,err)
                      }
                  )
              ;
          };
      }
    ])
  ;
}());
