/**
 * This file contains all necessary Angular controller definitions for 'frontend.login-history' module.
 *
 * Note that this file should only contain controllers and nothing else.
 */
(function () {
  'use strict';

  angular.module('frontend.routes')
    .controller('AddRouteModalController', [
      '_','$scope', '$rootScope', '$log', '$state', 'RoutesService', 'SettingsService',
      '$uibModalInstance', 'MessageService', '_service',
      function controller(_, $scope, $rootScope, $log, $state, RoutesService, SettingsService,
                          $uibModalInstance, MessageService, _service) {


        var availableFormattedVersion = RoutesService.getLastAvailableFormattedVersion($rootScope.Gateway.version);
        $scope.service = _service;
        $scope.route = angular.copy(RoutesService.getProperties($rootScope.Gateway.version));
        // Assign service id
        $scope.route.service = {
          id: _service.id
        };

        $scope.partial = 'js/app/routes/partials/form-route-' + availableFormattedVersion + '.html?r=' + Date.now();

        console.log("$scope.route", $scope.route, _service.id)

        $scope.close = function () {
          $uibModalInstance.dismiss()
        }


        $scope.submit = function () {

          clearRoute()


          RoutesService.add($scope.route)
            .then(function (res) {
              $rootScope.$broadcast('route.created')
              MessageService.success('Route created!')
              $uibModalInstance.dismiss(res);
            }).catch(function (err) {
            $log.error("Create new route error:", err)
            MessageService.error("Submission failed. " + _.get(err,'data.body.message',""));
            $scope.errors = {}
            if (err.data && err.data.body) {
              if(err.data.fields) {
                Object.keys(err.data.body.fields).forEach(function (key) {
                  $scope.errors[key] = err.data.body.fields[key]
                })
              }else{
                Object.keys(err.data.body).forEach(function (key) {
                  $scope.errors[key] = err.data.body[key]
                })
              }
            }
          })
        }


        function clearRoute() {
          for (var key in $scope.route) {

            if ($scope.route[key] instanceof Array && !$scope.route[key].length) {
              delete($scope.route[key]);
            }

            if ($scope.route[key] === undefined || $scope.route[key] === "") {
              delete($scope.route[key]);
            }
          }
        }


      }
    ])
  ;
}());
