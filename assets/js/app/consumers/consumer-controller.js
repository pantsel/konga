/**
 * This file contains all necessary Angular controller definitions for 'frontend.admin.login-history' module.
 *
 * Note that this file should only contain controllers and nothing else.
 */
(function () {
  'use strict';

  angular.module('frontend.consumers')
    .controller('ConsumerController', [
      '_', '$scope', '$log', '$state', '_consumer', '$rootScope', 'Semver',
      function controller(_, $scope, $log, $state, _consumer, $rootScope, Semver) {


        $scope.consumer = _consumer.data
        $state.current.data.pageName = "CONSUMER: " + ($scope.consumer.username || $scope.consumer.id)
        $scope.activeSection = 0;
        $scope.sections = [
          {
            id: 'details',
            name: 'Details',
            icon: 'mdi-information-outline'
          },
          {
            id: 'groups',
            name: 'Groups',
            icon: 'mdi-account-multiple-outline'
          },
          {
            id: 'credentials',
            name: 'Credentials',
            icon: 'mdi-security'
          },
          // {
          //   id: 'apis',
          //   name: 'Accessible APIs',
          //   icon: 'mdi-cloud-outline'
          // },
          {
            id: 'services',
            name: 'Accessible Routes',
            icon: 'mdi-cloud-outline'
          }
        ]

        if(!_.get($rootScope, 'Gateway.plugins.available_on_server.acl')) {
          $scope.sections = _.filter($scope.sections, function (item) {
            return item.id !== 'groups' && item.id !== 'apis' && item.id !== 'services' && item.id !== 'routes'
          })
        }

        if (Semver.cmp($rootScope.Gateway.version, "0.11.0") >= 0) {
          $scope.sections.push({
            id: 'plugins',
            name: 'Plugins',
            icon: 'mdi-power-plug'
          });
        }

        $scope.showPluginsSection = Semver.cmp($rootScope.Gateway.version, "0.11.0") >= 0;

        $scope.onTabsSelected = function (sectionId) {
          $scope.activeSection = sectionId;
        }


        $scope.$on('user.node.updated', function (node) {
          $state.go('consumers');
        });


      }
    ])
}());
