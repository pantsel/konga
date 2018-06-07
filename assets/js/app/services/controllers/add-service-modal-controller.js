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
            MessageService.error("Submission failed. Make sure you have completed all required fields.")
            $scope.errors = {}
            if (err.data && err.data.body) {
              if (err.data.body.fields) {
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


        function clearService() {
          for (var key in $scope.service) {
            if ($scope.service[key] === '') {
              delete($scope.service[key])
            }
          }
        }


      }
    ])
  ;
}());
