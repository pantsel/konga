(function () {
  'use strict';

  angular.module('frontend.plugins')
    .controller('PluginsController', [
      '_', '$scope', '$log', '$state', 'ApiService', 'PluginsService', 'MessageService',
      '$uibModal', 'DialogService', 'PluginModel', 'ListConfig', 'UserService',
      function controller(_, $scope, $log, $state, ApiService, PluginsService, MessageService,
                          $uibModal, DialogService, PluginModel, ListConfig, UserService) {

        PluginModel.setScope($scope, false, 'items', 'itemCount');
        $scope = angular.extend($scope, angular.copy(ListConfig.getConfig('plugin', PluginModel)));
        $scope.user = UserService.user();
        $scope.onEditPlugin = onEditPlugin
        $scope.updatePlugin = updatePlugin;
        $scope.togglePlugin = togglePlugin;
        $scope.getContext   = getContext;


        /**
         * ----------------------------------------------------------------------
         * Functions
         * ----------------------------------------------------------------------
         */


        function togglePlugin(plugin) {
          plugin.enabled = !plugin.enabled;
          updatePlugin(plugin);
        }

        function updatePlugin(plugin) {

          if (!$scope.user.hasPermission('plugins', 'update')) {

            MessageService.error("You don't have permissions to perform this action")
            return false;
          }

          PluginsService.update(plugin.id, {
            enabled: plugin.enabled
          })
            .then(function (res) {
              $log.debug("updatePlugin", res)
              // $scope.items.data[$scope.items.data.indexOf(plugin)] = res.data;

            }).catch(function (err) {
            $log.error("updatePlugin", err)
          })
        }


        function onEditPlugin(item) {

          if (!$scope.user.hasPermission('plugins', 'edit')) {
            return false;
          }

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

        function _fetchData() {

          $scope.loading = true;
          PluginModel.load({
            size: $scope.itemsFetchSize
          }).then(function (response) {
            $scope.items = response;
            console.log("LOADED PLUGINS => ", $scope.items);
            $scope.loading = false;
          })
        }

        function getContext(plugin) {
          if(plugin.service) {
            return 'services'
          } else if(plugin.route) {
            return 'routes'
          } else if(plugin.api) {
            return 'apis'
          }else{
            return 'global'
          }
        }

        /**
         * ------------------------------------------------------------
         * Listeners
         * ------------------------------------------------------------
         */
        $scope.$on("plugin.added", function () {
          _fetchData()
        })

        $scope.$on("plugin.updated", function (ev, plugin) {
          _fetchData()
        })


        $scope.$on('user.node.updated', function (node) {
          _fetchData()
        })


        _fetchData();

      }
    ])
  ;
}());
