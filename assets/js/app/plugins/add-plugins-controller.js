/**
 * This file contains all necessary Angular controller definitions for 'frontend.admin.login-history' module.
 *
 * Note that this file should only contain controllers and nothing else.
 */
(function () {
  'use strict';

  angular.module('frontend.plugins')
    .controller('AddPluginsController', [
      '_', '$scope', '$rootScope', '$log',
      '$state', 'ApiService', 'MessageService', 'DialogService',
      'KongPluginsService', 'PluginsService', '$uibModal',
      '_plugins', '_info',
      function controller(_, $scope, $rootScope, $log,
                          $state, ApiService, MessageService, DialogService,
                          KongPluginsService, PluginsService, $uibModal,
                          _plugins, _info) {


        var info = _info.data
        var plugins_available = info.plugins.available_on_server
        console.log("SERVER AVAILABLE PLUGINS => ", plugins_available)
        var pluginOptions = new KongPluginsService().pluginOptions()

        $scope.pluginOptions = pluginOptions
        new KongPluginsService().makePluginGroups().then(function (groups) {
          $scope.pluginGroups = groups
          $log.debug("Plugin Groups", $scope.pluginGroups)

          $scope.pluginGroups.forEach(function (group) {
            for (var key in group.plugins) {
              if (!plugins_available[key]) delete group.plugins[key]
            }
          })

          // Init
          syncPlugins(_plugins.data.data)
        })
        $scope.activeGroup = 'Authentication'
        $scope.setActiveGroup = setActiveGroup
        $scope.filterGroup = filterGroup
        $scope.onAddPlugin = onAddPlugin

        $scope.alert = {
          msg: '<strong>Plugins added in this section will be applied Globally</strong>.' +
          '<br>- If you need to add plugins to a specific Service or Route, you can do it' +
          ' in the respective section.' +
          '<br>- If you need to add plugins to a specific Consumer, you can do it' +
          ' in the respective Consumer\'s page.'
        }

        $scope.closeAlert = function () {
          $scope.alert = undefined
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
          $uibModal.open({
            animation: true,
            ariaLabelledBy: 'modal-title',
            ariaDescribedBy: 'modal-body',
            templateUrl: 'js/app/plugins/modals/add-plugin-modal.html',
            size: 'lg',
            controller: 'AddPluginController',
            resolve: {
              _context: function() {
                return null;
              },
              _pluginName: function () {
                return name
              },
              _schema: function () {
                return PluginsService.schema(name)
              }
            }
          });
        }

        function findPlugin(plugins, name) {
          for (var i = 0; i < plugins.length; i++) {
            if (plugins[i].name === name) {
              return plugins[i]
            }
          }
          return undefined
        }

        function syncPlugins(added) {

          var addedMap = added.map(function (item) {
            return item.name
          })

          $scope.pluginGroups.forEach(function (group) {
            for (var key in group.plugins) {
              if (addedMap.indexOf(key) > -1) {
                group.plugins[key].isAdded = true
                var plugin = findPlugin(added, key);
                if (plugin) {
                  for (var _key in plugin) {
                    group.plugins[key][_key] = plugin[_key]
                  }
                }
              } else {
                group.plugins[key].isAdded = false
              }
            }
          })
        }


        function fetchPlugins() {
          PluginsService.load()
            .then(function (res) {
              syncPlugins(res.data.data)
            })
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


      }
    ])
  ;
}());
