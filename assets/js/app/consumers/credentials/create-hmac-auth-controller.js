/**
 * This file contains all necessary Angular controller definitions for 'frontend.admin.login-history' module.
 *
 * Note that this file should only contain controllers and nothing else.
 */
(function() {
  'use strict';

  angular.module('frontend.consumers')
    .controller('CreateHMACAuthController', [
      '$scope', '$rootScope', '$log','ConsumerService','MessageService','$uibModalInstance','KongErrorService','_consumer',
      function controller($scope, $rootScope, $log, ConsumerService, MessageService, $uibModalInstance,KongErrorService, _consumer ) {

          $scope.consumer = _consumer
          $scope.createHMACAuthCredentials = createHMACAuthCredentials
          $scope.close = function(){
              $uibModalInstance.dismiss()
          }

          $scope.credentials = {
              username : '',
              secret : ''
          }


          function createHMACAuthCredentials() {

              // Clear secret if empty
              if($scope.credentials.secret == '')
                  delete $scope.credentials.secret

              ConsumerService.addCredential($scope.consumer.id,'hmac-auth',$scope.credentials).then(function(resp){
                  $log.debug("Credentials generated",resp)
                  $rootScope.$broadcast('consumer.hmac-auth.created')
                  $uibModalInstance.dismiss()
              }).catch(function(err){
                  $log.error(err)
                  KongErrorService.handle($scope, err);
              })
          }

      }
    ])
}());
