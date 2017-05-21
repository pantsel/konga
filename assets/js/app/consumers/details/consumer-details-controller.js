/**
 * This file contains all necessary Angular controller definitions for 'frontend.admin.login-history' module.
 *
 * Note that this file should only contain controllers and nothing else.
 */
(function() {
  'use strict';

  angular.module('frontend.consumers')
    .controller('ConsumerDetailsController', [
      '_','$scope', '$log', '$state','ConsumerModel','ListConfig','MessageService',
      function controller(_,$scope, $log, $state, ConsumerModel,ListConfig, MessageService) {

          ConsumerModel.setScope($scope, false, 'items', 'itemCount');
          $scope = angular.extend($scope, angular.copy(ListConfig.getConfig('consumer',ConsumerModel)));

          $scope.updateConsumerDetails = updateConsumerDetails

          function updateConsumerDetails() {
              ConsumerModel.update($scope.consumer.id,{
                      username : $scope.consumer.username,
                      custom_id : $scope.consumer.custom_id
                  })
                  .then(function(res){
                      $log.debug(res.data)
                      $scope.consumer = res.data
                      $scope.errors = {}
                      MessageService.success("Consumer updated successfully!")
                  }).catch(function(err){
                  $log.error("Failed to update consumer", err)
                  $scope.handleErrors(err)
              })
          }

      }
    ])
}());
