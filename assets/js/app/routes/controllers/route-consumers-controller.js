/**
 * This file contains all necessary Angular controller definitions for 'frontend.login-history' module.
 *
 * Note that this file should only contain controllers and nothing else.
 */
(function () {
  'use strict';

  angular.module('frontend.routes')
    .controller('RouteConsumersController', [
      '_', '$scope', '$stateParams', '$log', '$state', 'RoutesService','ConsumerModel','ListConfig',
      function controller(_, $scope, $stateParams, $log, $state, RoutesService, ConsumerModel, ListConfig) {


        ConsumerModel.setScope($scope, false, 'items', 'itemCount');
        $scope = angular.extend($scope, angular.copy(ListConfig.getConfig('consumerWithCreds',ConsumerModel)));
        $scope.search = '';

        $scope.loading = true;
        RoutesService.consumers($stateParams.route_id)
          .then(function (response) {
            console.log("GOT ROUTE CONSUMERS", response.data)
            if(response.data.data) {
              $scope.items = response.data;
              $scope.loading = false;
            }else{
              $scope.isOpenService = true;
            }

            $scope.loading = false;

          }).catch(function (err) {
          console.error("FAILED TO GET ROUTE CONSUMERS", err);
          $scope.loading = false;
        })


      }
    ])
  ;
}());
