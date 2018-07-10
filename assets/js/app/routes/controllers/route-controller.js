/**
 * This file contains all necessary Angular controller definitions for 'frontend.login-history' module.
 *
 * Note that this file should only contain controllers and nothing else.
 */
(function () {
  'use strict';

  angular.module('frontend.routes')
    .controller('RouteController', [
      '$scope', '$rootScope', '$state', 'SettingsService', '$log', '_route',
      function controller($scope, $rootScope, $state, SettingsService, $log, _route) {

        console.log("RouteController loaded");

        $scope.route = _route.data

        // Fix empty object properties
        fixProperties()

        $state.current.data.pageName = "Route " + ($scope.route.name || $scope.route.id)
        $scope.activeSection = 0;
        $scope.sections = [
          {
            name: 'Route Details',
            icon: 'mdi mdi-information-outline',
            isVisible: true
          },
          {
            name: 'Plugins',
            icon: 'mdi mdi-power-plug',
            isVisible: true
          },
          {
            name: 'Eligible consumers <span class="label label-danger">beta</span>',
            icon: 'mdi mdi-account-multiple-outline',
            isVisible: true
          },
        ]


        $scope.showSection = function (index) {
          $scope.activeSection = index
        }

        function fixProperties() {
          var problematicProperties = ['uris', 'hosts', 'methods']
          problematicProperties.forEach(function (property) {
            if ($scope.route[property] && isObject($scope.route[property]) && !Object.keys($scope.route[property]).length) {
              $scope.route[property] = ""
            }
          })
        }

        function isObject(obj) {
          return obj === Object(obj);
        }


        $scope.$on('user.node.updated', function (node) {
          $state.go('routes')
        })

      }
    ])
  ;
}());
