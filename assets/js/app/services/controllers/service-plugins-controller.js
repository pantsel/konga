/**
 * This file contains all necessary Angular controller definitions for 'frontend.admin.login-history' module.
 *
 * Note that this file should only contain controllers and nothing else.
 */
(function () {
  'use strict';

  angular.module('frontend.services')
    .controller('ServicePluginsController', [
      '_', '$scope', '$stateParams', '$log', '$state', 'ServiceService', 'PluginsService',
      '$uibModal', 'DialogService','AuthService',
      function controller(_, $scope, $stateParams, $log, $state, ServiceService, PluginsService,
                          $uibModal, DialogService, AuthService) {


        $scope.plugins = {
          data: []
        };
        $scope.onAddPlugin = onAddPlugin;
        $scope.onEditPlugin = onEditPlugin;
        $scope.deletePlugin = deletePlugin;
        $scope.updatePlugin = updatePlugin;
        $scope.togglePlugin = togglePlugin;
        $scope.canCreate = AuthService.hasPermission('plugins','create');
        $scope.canEdit = AuthService.hasPermission('plugins','edit');
        $scope.canDelete = AuthService.hasPermission('plugins','delete');
        $scope.search = ''


        fetchPlugins();

        /**
         * ----------------------------------------------------------------------
         * Functions
         * ----------------------------------------------------------------------
         */


        function togglePlugin(plugin) {
          plugin.enabled = !plugin.enabled;
          updatePlugin(plugin);
        }

        function onAddPlugin() {
          $uibModal.open({
            animation: true,
            ariaLabelledBy: 'modal-title',
            ariaDescribedBy: 'modal-body',
            templateUrl: 'js/app/services/views/add-service-plugin-modal.html',
            size: 'lg',
            controller: 'AddServicePluginModalController',
            resolve: {
              _service: function () {
                return $scope.service
              },
              _plugins: function () {
                return PluginsService.load()
              },
              _info: [
                '$stateParams',
                'InfoService',
                '$log',
                function resolve(
                  $stateParams,
                  InfoService,
                  $log
                ) {
                  return InfoService.getInfo()
                }
              ]
            }
          });
        }

        function updatePlugin(plugin) {
          PluginsService.update(plugin.id, {
            enabled: plugin.enabled,
            //config : plugin.config
          })
            .then(function (res) {
              $log.debug("updatePlugin", res)
              $scope.plugins.data[$scope.plugins.data.indexOf(plugin)] = res.data;

            }).catch(function (err) {
            $log.error("updatePlugin", err)
          })
        }

        function deletePlugin(plugin) {
          DialogService.prompt(
            "Delete Plugin", "Really want to delete the plugin?",
            ['No don\'t', 'Yes! delete it'],
            function accept() {
              PluginsService.delete(plugin.id)
                .then(function (resp) {
                  $scope.plugins.data.splice($scope.plugins.data.indexOf(plugin), 1);
                }).catch(function (err) {
                $log.error(err)
              })
            }, function decline() {
            })
        }

        function onEditPlugin(item) {
          $uibModal.open({
            animation: true,
            ariaLabelledBy: 'modal-title',
            ariaDescribedBy: 'modal-body',
            templateUrl: 'js/app/plugins/modals/edit-plugin-modal.html',
            size: 'lg',
            controller: 'EditPluginController',
            resolve: {
              _plugin: function () {
                return _.cloneDeep(item)
              },
              _schema: function () {
                return PluginsService.schema(item.name)
              }
            }
          });
        }

        function fetchPlugins() {
          $scope.loading = true;
          ServiceService.plugins($stateParams.service_id)
            .then(function (response) {
              $scope.plugins = response.data
              console.log("Plugins", $scope.plugins);
              $scope.loading = false;
            }).catch(function (error) {
            console.error(error);
            $scope.loading = false;
          })
        }


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
