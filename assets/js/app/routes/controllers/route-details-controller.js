/**
 * This file contains all necessary Angular controller definitions for 'frontend.login-history' module.
 *
 * Note that this file should only contain controllers and nothing else.
 */
(function () {
  'use strict';

  angular.module('frontend.routes')
    .controller('RouteDetailsController', [
      '$scope', '$rootScope', '$log', '$state', 'RoutesService', 'MessageService', 'SettingsService', '_route',
      function controller($scope, $rootScope, $log, $state, RoutesService, MessageService, SettingsService, _route) {

        var availableFormattedVersion = RoutesService.getLastAvailableFormattedVersion($rootScope.Gateway.version);
        $scope.route = $scope.route || _route;
        $scope.settings = SettingsService.getSettings();
        $scope.partial = 'js/app/routes/partials/form-route-' + availableFormattedVersion + '.html?r=' + Date.now();

        $scope.submit = function () {

          $scope.loading = true

          if(!$scope.route.hosts) $scope.route.hosts = [];
          if(!$scope.route.paths) $scope.route.paths = [];
          if(!$scope.route.methods) $scope.route.methods = [];
          if(!$scope.route.protocols) $scope.route.protocols = [];
          // if(!$scope.route.snis) $scope.route.snis = [];
          // if(!$scope.route.sources) $scope.route.sources = [];
          // if(!$scope.route.destinations) $scope.route.destinations = [];

          console.log("Submitting route", $scope.route);

          RoutesService.update($scope.route.id, _.omit($scope.route,["id", "data"]))
            .then(function (res) {
              $log.debug("Update Route: ", res)
              $scope.loading = false
              MessageService.success('Route updated successfully!')
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

      }
    ])
  ;
}());
