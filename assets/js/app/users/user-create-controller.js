(function() {
  'use strict';

  angular.module('frontend.users')
    .controller('UserCreateController', [
      '_','$scope','$q','$log','UserService','MessageService','$state','DialogService','UserModel',
      function controller(_,$scope,$q,$log, UserService, MessageService,$state,DialogService,UserModel ) {

          // Initialize user model
          $scope.user = {
              username : '',
              firstName : '',
              lastName : '',
              admin : false,
              active : true,
              passports : {
                  password : '',
                  protocol : 'local'
              },
              password_confirmation : '',

          }

          /**
           * Scope function to store new user to database.
           */
          $scope.createUser = function createUser() {
              $scope.busy = true;
              UserModel
                  .create(angular.copy($scope.user))
                  .then(
                      function onSuccess(result) {
                          MessageService.success('New user created successfully');
                          $scope.busy = false;
                          $state.go('users.show', {id: result.data.id});
                      },function(err){
                          $log.error(err);
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
