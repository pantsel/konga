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

        $scope.onTagInputKeyPress = function ($event) {
          if($event.keyCode === 13) {
            if(!$scope.route.tags) $scope.route.tags = [];
            $scope.route.tags = $scope.route.tags.concat($event.currentTarget.value);
            $event.currentTarget.value = null;
          }
        }


        $scope.submit = function () {

          clearRoute()

          const data = _.cloneDeep($scope.route)

          // Format sources, destingations and headers
          if(data.sources && data.sources.length) {
            data.sources = _.map(data.sources, (item) => {
              const parts = item.split(":");
              const obj = {};
              obj.ip = parts[0]
              if(parts[1]) obj.port = parseInt(parts[1])
              return obj;
            })
          }

          if(data.destinations && data.destinations.length) {
            data.destinations = _.map(data.destinations, (item) => {
              const parts = item.split(":");
              const obj = {};
              obj.ip = parts[0]
              if(parts[1]) obj.port = parseInt(parts[1])
              return obj;
            })
          }

          if(data.headers && data.headers.length) {
            data.headers = _.map(data.headers, (item) => {
              const parts = item.split(":");
              const obj = {};
              obj[parts[0]] = parts[1].split(",").filter(function (el) {
                return el;
              })
              return obj;
            }).reduce(function(r, e) {
              const key = Object.keys(e)[0];
              const value = e[key];
              r[key] = value;
              return r;
            }, {});
          }

          console.log("Route =>", data);
          $scope.errorMessage = '';

          RoutesService.add(data)
            .then(function (res) {
              $rootScope.$broadcast('route.created')
              MessageService.success('Route created!')
              $uibModalInstance.dismiss(res);
            }).catch(function (err) {
            $log.error("Create new route error:", err)
            MessageService.error("Submission failed. " + _.get(err,'data.body.message',""));
            $scope.errors = {}
            const errorBody = _.get(err, 'data.body');
            if (errorBody) {
              if (errorBody.fields) {

                for (let key in errorBody.fields) {
                  $scope.errors[key] = errorBody.fields[key]
                }
              }
              $scope.errorMessage = errorBody.message || '';
            } else {
              $scope.errorMessage = "An unknown error has occured"
            }

          })
        }


        function clearRoute() {
          for (var key in $scope.route) {

            if ($scope.route[key] instanceof Array && !$scope.route[key].length) {
              $scope.route[key] = null
            }

            if ($scope.route[key] === undefined || $scope.route[key] === "") {
              $scope.route[key] = null
            }
          }
        }


      }
    ])
  ;
}());
