/**
 * This file contains all necessary Angular controller definitions for 'frontend.admin.login-history' module.
 *
 * Note that this file should only contain controllers and nothing else.
 */
(function() {
  'use strict';

  angular.module('frontend.consumers')
    .controller('CreateKeyAuthController', [
      '$scope', '$rootScope', '$log','ConsumerService','MessageService','$uibModalInstance','_consumer',
      function controller($scope, $rootScope, $log, ConsumerService, MessageService, $uibModalInstance,_consumer ) {

          $scope.consumer = _consumer
          $scope.createApiKey = createApiKey
          $scope.close = function(){
              $uibModalInstance.dismiss()
          }

          $scope.key = {
              value : ''
          }


          function createApiKey() {

              var body = $scope.key.value ? {key : $scope.key.value} : {}

              ConsumerService.addCredential($scope.consumer.id,'key-auth',body).then(function(resp){
                  $log.debug("Key generated",resp)
                  $rootScope.$broadcast('consumer.key.created')
                  $uibModalInstance.dismiss()
              }).catch(function(err){
                  $log.error(err)
                  $scope.errors = err.data.body || err.data.customMessage || {}
              })
          }





      }
    ])
}());
