/**
 * This file contains all necessary Angular controller definitions for 'frontend.login-history' module.
 *
 * Note that this file should only contain controllers and nothing else.
 */
(function () {
  'use strict';

  angular.module('frontend.services')
    .controller('AddServiceModalController', [
      '$scope', '$rootScope', '$log', '$state', 'ServiceService', 'SettingsService',
      '$uibModalInstance', 'MessageService',
      function controller($scope, $rootScope, $log, $state, ServiceService, SettingsService,
                          $uibModalInstance, MessageService) {

        $scope.tags = [];
        var availableFormattedVersion = ServiceService.getLastAvailableFormattedVersion($rootScope.Gateway.version);
        $scope.service = angular.copy(ServiceService.getProperties($rootScope.Gateway.version));

        $scope.partial = 'js/app/services/partials/form-service-' + availableFormattedVersion + '.html?r=' + Date.now();

        $log.debug("$scope.service", $scope.service)

        $scope.close = function () {
          $uibModalInstance.dismiss()
        }


        $scope.submit = function () {

          clearService()


          ServiceService.add($scope.service)
            .then(function (res) {
              $rootScope.$broadcast('service.created')
              MessageService.success('Service created!')
              $uibModalInstance.dismiss()
            }).catch(function (err) {
            $log.error("Create new service error:", err)
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

            MessageService.error($scope.errorMessage || "Submission failed. Make sure you have completed all required fields.")
          })
        }

        function clearService() {
          for (var key in $scope.service) {
            if ($scope.service[key] === '') {
              delete($scope.service[key])
            }
          }
        }

        $scope.onTagInputKeyPress = function ($event) {
          if($event.keyCode === 13) {
            if($rootScope.isGatewayVersionEqOrGreater("1.1.0rc1")) {
              if(!$scope.service.tags) $scope.service.tags = [];
              $scope.service.tags = $scope.service.tags.concat($event.currentTarget.value);
            }else{
              if(!$scope.service.extras) $scope.service.extras = {};
              if(!$scope.service.extras.tags) $scope.service.extras.tags = [];
              $scope.service.extras.tags = $scope.service.extras.tags.concat($event.currentTarget.value);
            }
            $event.currentTarget.value = null;
          }
        }

        function getTags() {
          ServiceService.getTags().then(function (res) {
            $scope.tags = res.data;
          }).catch(function (err) {
            console.error(err);
          })
        }

        getTags();


      }
    ])
  ;
}());
