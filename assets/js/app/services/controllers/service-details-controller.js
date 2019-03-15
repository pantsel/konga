/**
 * This file contains all necessary Angular controller definitions for 'frontend.login-history' module.
 *
 * Note that this file should only contain controllers and nothing else.
 */
(function () {
  'use strict';

  angular.module('frontend.services')
    .controller('ServiceDetailsController', [
      '_', '$scope', '$rootScope', '$log', '$state', 'ServiceService', '$uibModal', 'MessageService', 'SettingsService',
      function controller(_, $scope, $rootScope, $log, $state, ServiceService, $uibModal, MessageService, SettingsService) {

        var availableFormattedVersion = ServiceService.getLastAvailableFormattedVersion($rootScope.Gateway.version);
        $scope.settings = SettingsService.getSettings();
        $scope.tags = [];
        $scope.partial = 'js/app/services/partials/form-service-' + availableFormattedVersion + '.html?r=' + Date.now();

        // Store the original service in a var so that we can later check if the name is modified.
        // This is a monkey patch that fixes Kong's API inconsistency when using Cassandra in v0.13.x.
        // https://github.com/Kong/kong/issues/3534
        var originalService = angular.copy($scope.service);

        $scope.updateService = function () {

          $scope.loading = true
          var data = angular.copy($scope.service);

          // workaround, name field creates constraint violation in v0.13.x when using Cassandra
          if (!isKongUsingPostgres() && originalService.name === data.name) {
            delete data.name;
          }

          // Kong 1.x compat
          delete data.data;

          ServiceService.update(data)
            .then(function (res) {
              console.log("Update Service: ", res)
              $scope.loading = false
              MessageService.success('Service updated successfully!');
              originalService = res.data; // ref. monkey patch
            }).catch(function (err) {
            console.log("err", err)
            $scope.loading = false
            var errors = {}
            Object.keys(err.data.body).forEach(function (key) {
              MessageService.error(key + " : " + err.data.body[key])
            })
            $scope.errors = errors
          })

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

        function isKongUsingPostgres() {
          return _.get($rootScope.Gateway, 'configuration.database') === 'postgres';
        }

        getTags();

      }
    ])
  ;
}());
