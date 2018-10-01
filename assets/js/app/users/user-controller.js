/**
 * This file contains all necessary Angular controller definitions for 'frontend.admin.login-history' module.
 *
 * Note that this file should only contain controllers and nothing else.
 */
(function () {
  'use strict';

  angular.module('frontend.users')
    .controller('UserController', [
      '_', '$scope', '$q', '$log', 'UserService', 'MessageService', '$state', 'DialogService', 'UserModel','NodeModel', '_user',
      function controller(_, $scope, $q, $log, UserService, MessageService, $state, DialogService, UserModel,NodeModel, _user) {

        // Set current scope reference to models
        UserModel.setScope($scope, 'user');

        // Expose necessary data
        $scope.user = _user;

        console.log("$scope.user",$scope.user);

        initUserPassports()
        $scope.authUser = UserService.user();

        // User delete dialog buttons configuration
        $scope.confirmButtonsDelete = {
          ok: {
            label: 'Delete',
            className: 'btn-danger btn-link',
            callback: function callback() {
              $scope.deleteUser();
            }
          },
          cancel: {
            label: 'Cancel',
            className: 'btn-default btn-link'
          }
        };

        // Scope function to save modified user.
        $scope.saveUser = function saveUser() {

          var data = angular.copy($scope.user);

          $scope.errors = {}

          // Make actual data update
          var deferred = $q.defer();


          data.passports.protocol = 'local'; // Make sure the protocol is set

          console.log("data", data)
          // return false;

          UserModel
            .update(data.id, data)
            .then(
              function onSuccess(data) {
                $scope.showForm = false;
                MessageService.success('User "' + $scope.user.username + '" updated successfully');
                initUserPassports()
                UserService.updateUser(data.data, true)
                deferred.resolve(true);
              }, function (err) {
                console.log("Err", err)
                UserModel.handleError($scope, err)
                deferred.reject('Error');
              }
            );

          return deferred.promise;
        };

        // Scope function to delete user
        $scope.deleteUser = function deleteUser() {
          UserModel
            .delete($scope.user.id)
            .then(
              function onSuccess() {
                MessageService.success('User "' + $scope.user.username + '" deleted successfully');
                $state.go('users');
              }
            ).catch(err => {
            MessageService.error(_.get(err, 'data.message', 'Failed to delete user'));
          })
          ;
        };

        $scope.cancelEditing = function () {
          $scope.editableForm.$cancel()
          initUserPassports()
        }

        function initUserPassports() {
          $scope.user.passports = {
            password: "",
            protocol: 'local'
          }
          $scope.user.password_confirmation = ""
        }

        initUserPassports()

        fetchConnections();

        function fetchConnections() {
          NodeModel
            .load()
            .then(
              function onSuccess(response) {
                console.log(response)
                $scope.connections = response;
                console.log("@@@@@@@@@@@@@@@@@@@@@", $scope.connections);

              }
            );
        }

      }
    ])
  ;
}());
