/**
 * This file contains all necessary Angular controller definitions for 'frontend.login-history' module.
 *
 * Note that this file should only contain controllers and nothing else.
 */
(function () {
  'use strict';

  angular.module('frontend.apis')
    .controller('ApiController', [
      '$scope', '$rootScope', '$state', 'SettingsService', '$log', '_api',
      function controller($scope, $rootScope, $state, SettingsService, $log, _api) {

        $scope.api = _api.data

        // Fix empty object properties
        fixProperties()

        $state.current.data.pageName = "API " + ($scope.api.name || $scope.api.id)
        $scope.activeSection = 0;
        $scope.sections = [
          {
            name: 'API Details',
            icon: 'mdi mdi-information-outline',
            isVisible: true
          },
          {
            name: 'Plugins',
            icon: 'mdi mdi-power-plug',
            isVisible: true
          },
          {
            name: 'Health Checks',
            icon: 'mdi mdi-heart-pulse',
            isVisible: true
          },
          // {
          //   name: 'Metrics<span class="badge badge-danger pull-right">beta</span>',
          //   icon: 'mdi mdi-chart-bar',
          //   isVisible: true
          // }
        ]


        $scope.showSection = function (index) {
          $scope.activeSection = index;
        }

        function fixProperties() {
          var problematicProperties = ['uris', 'hosts', 'methods']
          problematicProperties.forEach(function (property) {
            if ($scope.api[property] && isObject($scope.api[property]) && !Object.keys($scope.api[property]).length) {
              $scope.api[property] = "";
            }
          });
        }

        function isObject(obj) {
          return obj === Object(obj);
        }


        $scope.$on('user.node.updated', function (node) {
          $state.go('apis');
        });

      }
    ])
  ;
}());
