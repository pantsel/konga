/**
 * This file contains all necessary Angular controller definitions for 'frontend.admin.login-history' module.
 *
 * Note that this file should only contain controllers and nothing else.
 */
(function() {
  'use strict';

  angular.module('frontend.consumers')
    .controller('CreateOAuth2Controller', [
      '_','$scope', '$rootScope', '$log','ConsumerService','MessageService','$uibModalInstance','_consumer', 'KongErrorService',
      function controller(_, $scope, $rootScope, $log, ConsumerService, MessageService, $uibModalInstance,_consumer, KongErrorService ) {

          $scope.consumer = _consumer
          $scope.create = create
          $scope.close = function(){
              $uibModalInstance.dismiss()
          }

          $scope.jwt = {
              key : '',
              algorithm : 'HS256',
              rsa_public_key : '',
              secret : ''
          }


          function create() {

              console.log("oauth2 credential", $scope.data);

              ConsumerService.addCredential($scope.consumer.id,'oauth2',$scope.data).then(function(resp){
                  $log.debug("OAuth2 generated",resp)
                  $rootScope.$broadcast('consumer.oauth2.created')
                  $uibModalInstance.dismiss()
              }).catch(function(err){
                  $log.error(err)
                  KongErrorService.handle($scope, err);
              })
          }

      }
    ])
}());
