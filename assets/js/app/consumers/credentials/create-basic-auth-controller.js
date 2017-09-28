/**
 * This file contains all necessary Angular controller definitions for 'frontend.admin.login-history' module.
 *
 * Note that this file should only contain controllers and nothing else.
 */
(function() {
  'use strict';

  angular.module('frontend.consumers')
    .controller('CreateBasicAuthController', [
      '$scope', '$rootScope', '$log','ConsumerService','MessageService','$uibModalInstance','_consumer',
      function controller($scope, $rootScope, $log, ConsumerService, MessageService, $uibModalInstance,_consumer ) {

          $scope.consumer = _consumer
          $scope.createBasicAuthCredentials = createBasicAuthCredentials
          $scope.close = function(){
              $uibModalInstance.dismiss()
          }

          $scope.credentials = {
              username : '',
              password : ''
          }


          function createBasicAuthCredentials() {
              ConsumerService
                  .addCredential($scope.consumer.id,'basic-auth',$scope.credentials).then(function(resp){
                  $log.debug("Credentials generated",resp)
                  $rootScope.$broadcast('consumer.basic-auth.created')
                  $uibModalInstance.dismiss()
              }).catch(function(err){
                  $log.error(err)
                  $scope.errors = err.data.body || err.data.customMessage || {}
              })
          }

      }
    ])
}());
