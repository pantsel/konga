/**
 * This file contains all necessary Angular controller definitions for 'frontend.admin.login-history' module.
 *
 * Note that this file should only contain controllers and nothing else.
 */
(function() {
  'use strict';

  angular.module('frontend.consumers')
    .controller('MassAssignCredentialsController', [
        "$log","$q","$scope","$rootScope","$uibModalInstance","ConsumerService","DialogService",
        "MessageService","_consumers",
      function controller($log,$q,$scope,$rootScope,$uibModalInstance,ConsumerService,DialogService,
                          MessageService,_consumers) {

          $scope.consumers = _consumers
          $scope.close = function() {
              $uibModalInstance.dismiss()
          }

          $scope.credentials = [
              {
                  name : "Key Auth",
                  description : "Generate an API key for each consumer.",
                  value : "key-auth"
              },
              {
                  name : "JWT",
                  description : "Generate JWT credentials for each consumer." +
                  " The default values will be used for all of JWT configuration properties" +
                  " as specified in <a href='https://getkong.org/plugins/jwt/'>Kong's documentation</a>.",
                  value : "jwt"
              },
              {
                  name : "HMAC Auth",
                  description : "Generate HMAC credentials for each consumer." +
                  "The consumer's username will be used as the username property " +
                  "and a secret will be auto-generated for each credential.",
                  value : "hmac-auth"
              }
          ]


          $scope.onCredentialSelected = function(credential) {
              DialogService.confirm(
                  "Mass Assign Credentials",
                  "You are about to mass assign <strong>" + credential + "</strong> credentials" +
                  " to " + $scope.consumers.length + " selected consumers.<br>Continue?",
                  ['No don\'t','Yes, do it!'],
                  function accept(){
                      $scope.busy = true

                      var promises = []

                      switch(credential) {
                          case "hmac-auth":
                              _consumers.forEach(function(consumer){
                                  promises.push(ConsumerService.addCredential(consumer.id,credential,{
                                      username : consumer.username,
                                      secret   : Math.random().toString(36).slice(-8)
                                  }))
                              })
                              break;
                          default:
                              _consumers.forEach(function(consumer){
                                  promises.push(ConsumerService.addCredential(consumer.id,credential))
                              })
                      }



                      $q
                          .all(promises)
                          .finally(
                              function onFinally() {
                                  $scope.busy = false;
                                  MessageService.success('Credentials where assigned successfully!')
                                  $rootScope.$broadcast('credentials.assigned')
                              }
                          )
                      ;

                  },function decline(){})
          }




      }
    ])
}());
