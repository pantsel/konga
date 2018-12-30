/**
 * This file contains all necessary Angular controller definitions for 'frontend.admin.login-history' module.
 *
 * Note that this file should only contain controllers and nothing else.
 */
(function() {
  'use strict';

  angular.module('frontend.consumers')
    .controller('CreateJWTController', [
      '_','$scope', '$rootScope', '$log','ConsumerService','MessageService','$uibModalInstance', 'KongErrorService', '_consumer',
      function controller(_, $scope, $rootScope, $log, ConsumerService, MessageService, $uibModalInstance, KongErrorService, _consumer ) {

          $scope.consumer = _consumer
          $scope.createJWT = createJWT
          $scope.close = function(){
              $uibModalInstance.dismiss()
          }

          $scope.jwt = {
              key : '',
              algorithm : 'HS256',
              rsa_public_key : '',
              secret : ''
          }

          function cleanJWT(jwt) {

              var jwtClone = _.clone(jwt)

              for(var key in jwtClone) {
                  if(!jwtClone[key] || jwtClone[key] == ''){
                      delete jwtClone[key]
                  }
              }

              return jwtClone
          }


          function createJWT() {

              ConsumerService.addCredential($scope.consumer.id,'jwt',cleanJWT($scope.jwt)).then(function(resp){
                  $log.debug("JWT generated",resp)
                  $rootScope.$broadcast('consumer.jwt.created')
                  $uibModalInstance.dismiss()
              }).catch(function(err){
                  $log.error(err)
                  KongErrorService.handle($scope, err);
              })
          }

      }
    ])
}());
