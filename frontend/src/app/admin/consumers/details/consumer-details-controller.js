/**
 * This file contains all necessary Angular controller definitions for 'frontend.admin.login-history' module.
 *
 * Note that this file should only contain controllers and nothing else.
 */
(function() {
  'use strict';

  angular.module('frontend.admin.consumers')
    .controller('ConsumerDetailsController', [
      '_','$scope', '$log', '$state','ConsumerService','MessageService',
      function controller(_,$scope, $log, $state, ConsumerService, MessageService) {

          $scope.updateConsumerDetails = updateConsumerDetails

          function updateConsumerDetails() {
              ConsumerService.update($scope.consumer.id,{
                      username : $scope.consumer.username,
                      custom_id : $scope.consumer.custom_id
                  })
                  .then(function(res){
                      $log.debug(res.data)
                      $scope.consumer = res.data
                      MessageService.success("Consumer updated successfully!")
                  }).catch(function(err){
                  $log.error("Failed to update consumer", err)
                  $scope.errors = err.data.customMessage || {}
              })
          }

      }
    ])
}());
