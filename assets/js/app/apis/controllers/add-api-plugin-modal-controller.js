/**
 * This file contains all necessary Angular controller definitions for 'frontend.admin.login-history' module.
 *
 * Note that this file should only contain controllers and nothing else.
 */
(function () {
  'use strict';

  angular.module('frontend.apis')
    .controller('AddApiPluginModalController', [
      '_', '$scope', '$rootScope', '$log',
      '$state', 'ApiService', 'MessageService', 'DialogService',
      'KongPluginsService', 'PluginsService', '$uibModal', '$uibModalInstance',
      '_api',
      function controller(_, $scope, $rootScope, $log,
                          $state, ApiService, MessageService, DialogService,
                          KongPluginsService, PluginsService, $uibModal, $uibModalInstance,
                          _api) {


        var pluginOptions = new KongPluginsService().pluginOptions()

        $scope.api = _api
        $scope.pluginOptions = pluginOptions

        new KongPluginsService().makePluginGroups().then(function (groups) {
          $scope.pluginGroups = groups

          // Remove ssl plugin if Kong > 0.9.x
          if ($rootScope.Gateway.version.indexOf('0.9.') < 0) {
            $scope.pluginGroups.forEach(function (group) {
              Object.keys(group.plugins).forEach(function (key) {
                if (key == 'ssl') delete group.plugins[key]
              })
            })
          }

          $log.debug("Plugin Groups", $scope.pluginGroups)
        })

        $scope.activeGroup = 'Authentication'
        $scope.setActiveGroup = setActiveGroup
        $scope.filterGroup = filterGroup
        $scope.onAddPlugin = onAddPlugin
        $scope.close = function () {
          return $uibModalInstance.dismiss()
        }


        /**
         * -------------------------------------------------------------
         * Functions
         * -------------------------------------------------------------
         */

        function setActiveGroup(name) {
          $scope.activeGroup = name
        }

        function filterGroup(group) {
          return group.name == $scope.activeGroup
        }

        function onAddPlugin(name) {
          var modalInstance = $uibModal.open({
            animation: true,
            ariaLabelledBy: 'modal-title',
            ariaDescribedBy: 'modal-body',
            templateUrl: 'js/app/plugins/modals/add-plugin-modal.html',
            size: 'lg',
            controller: 'AddPluginController',
            resolve: {
              _context: function() {
                return {
                  name: 'api',
                  data: $scope.api
                }
              },
              _pluginName: function () {
                return name
              },
              _schema: function () {
                return PluginsService.schema(name)
              }
            }
          });

          modalInstance.result.then(function (data) {

          }, function (data) {
            if (data && data.name && $scope.existingPlugins.indexOf(data.name) < 0) {
              $scope.existingPlugins.push(data.name)
            }
          });
        }


        // Listeners
        $scope.$on('plugin.added', function () {
          fetchPlugins()
        })

        /**
         * ------------------------------------------------------------
         * Listeners
         * ------------------------------------------------------------
         */
        $scope.$on("plugin.added", function () {
          fetchPlugins()
        })

        $scope.$on("plugin.updated", function (ev, plugin) {
          fetchPlugins()
        })


        function fetchPlugins() {
          PluginsService.load()
            .then(function (res) {

            })
        }

        function getApiPlugins() {
          ApiService.plugins($scope.api.id)
            .then(function (response) {
              $scope.existingPlugins = response.data.data.map(function (item) {
                return item.name
              })
            })
            .catch(function (err) {

            })
        }


        getApiPlugins();

      }
    ])
  ;
}());
