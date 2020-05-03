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
        
        // Transform sources and destinations
        if($scope.route.sources && $scope.route.sources.length) {
          $scope.route.sources = _.map($scope.route.sources, source => {
            return source.ip + (source.port ? ":" + source.port : "");
          })
        }

        if($scope.route.destinations && $scope.route.destinations.length) {
          $scope.route.destinations = _.map($scope.route.destinations, dest => {
            return dest.ip + (dest.port ? ":" + dest.port : "");
          })
        }

        $scope.settings = SettingsService.getSettings();
        $scope.partial = 'js/app/routes/partials/form-route-' + availableFormattedVersion + '.html?r=' + Date.now();

        $scope.onTagInputKeyPress = function ($event) {
          if($event.keyCode === 13) {
            if(!$scope.route.tags) $scope.route.tags = [];
            $scope.route.tags = $scope.route.tags.concat($event.currentTarget.value);
            $event.currentTarget.value = null;
          }
        }

        $scope.submit = function () {

          $scope.loading = true

          let data = _.cloneDeep($scope.route);

          if(!data.hosts || !data.hosts.length) data.hosts = null;
          if(!data.paths || !data.paths.length) data.paths = null;
          if(!data.methods || !data.methods.length) data.methods = null;
          if(!data.protocols || !data.protocols.length) data.protocols = null;
          if(!data.snis || !data.snis.length) data.snis = null;
          if(!data.sources || !data.sources.length) data.sources = null;
          if(!data.destinations || !data.destinations.length) data.destinations = null;

          // Format sources and destingations
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

          console.log("Submitting route", data);

          RoutesService.update($scope.route.id, _.omit(data,["id", "data"]))
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
