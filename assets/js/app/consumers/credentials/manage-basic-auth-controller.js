/**
 * This file contains all necessary Angular controller definitions for 'frontend.admin.login-history' module.
 *
 * Note that this file should only contain controllers and nothing else.
 */
(function () {
  'use strict';

  angular.module('frontend.consumers')
    .controller('ManageBasicAuthController', [
      '$scope', '$rootScope', '$log', 'ConsumerService', 'MessageService', '$uibModalInstance', 'KongErrorService', '_consumer', '_cred',
      function controller($scope, $rootScope, $log, ConsumerService, MessageService, $uibModalInstance, KongErrorService, _consumer, _cred) {

        $scope.consumer = _consumer
        $scope.manage = manage
        $scope.close = function () {
          $uibModalInstance.dismiss()
        }

        if (_cred) {
          $scope.credentials = angular.copy(_cred)
        } else {
          $scope.credentials = {
            username: '',
            password: ''
          }
        }

        function manage() {
          if ($scope.credentials.id) {
            update();
          } else {
            create();
          }
        }

        function create() {
          ConsumerService
            .addCredential($scope.consumer.id, 'basic-auth', $scope.credentials).then(function (resp) {
            $log.debug("Credentials generated", resp)
            $rootScope.$broadcast('consumer.basic-auth.created')
            $uibModalInstance.dismiss()
          }).catch(function (err) {
            $log.error(err)
            KongErrorService.handle($scope, err);
          })
        }

        function update() {
          ConsumerService
            .updateCredential($scope.consumer.id, 'basic-auth', $scope.credentials.id, $scope.credentials).then(function (resp) {
            $log.debug("Credentials generated", resp)
            $rootScope.$broadcast('consumer.basic-auth.created')
            $uibModalInstance.dismiss()
          }).catch(function (err) {
            $log.error(err)
            KongErrorService.handle($scope, err);
          })
        }
      }
    ])
}());
