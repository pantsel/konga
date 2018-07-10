/**
 * This file contains all necessary Angular controller definitions for 'frontend.login-history' module.
 *
 * Note that this file should only contain controllers and nothing else.
 */
(function () {
  'use strict';

  angular.module('frontend.services')
    .controller('ServiceConsumersController', [
      '_', '$scope', '$rootScope', '$stateParams', '$log', '$state', 'ServiceService','ConsumerModel','ListConfig',
      function controller(_, $scope, $stateParams, $rootScope, $log, $state, ServiceService, ConsumerModel, ListConfig) {


        ConsumerModel.setScope($scope, false, 'items', 'itemCount');
        $scope = angular.extend($scope, angular.copy(ListConfig.getConfig('consumer',ConsumerModel)));
        $scope.search = '';


        $scope.loading = true;
        ServiceService.consumers($scope.service.id)
          .then(function (response) {
            console.log("GOT SERVICE CONSUMERS", response.data)
            if (response.data.total > 0) {
              $scope.items = response.data;
              $scope.loading = false;
            } else {
              $scope.isOpenService = true;
              $scope.loading = false;
            }
          }).catch(function (err) {
          console.error("FAILED TO GET SERVICE CONSUMERS", err);
          $scope.loading = false;
        })


      }
    ])
  ;
}());
