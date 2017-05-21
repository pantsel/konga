(function() {
  'use strict';

  angular.module('frontend.plugins')
    .controller('PluginsController', [
        '_','$scope', '$log', '$state','ApiService','PluginsService',
        '$uibModal','DialogService','PluginModel','ListConfig','UserService',
      function controller(_,$scope, $log, $state, ApiService, PluginsService,
                          $uibModal, DialogService, PluginModel, ListConfig, UserService ) {

          PluginModel.setScope($scope, false, 'items', 'itemCount');
          $scope = angular.extend($scope, angular.copy(ListConfig.getConfig('plugin',PluginModel)));
          $scope.user = UserService.user();
          $scope.onEditPlugin = onEditPlugin
          $scope.updatePlugin = updatePlugin


          /**
           * ----------------------------------------------------------------------
           * Functions
           * ----------------------------------------------------------------------
           */

           function updatePlugin(plugin) {
              PluginsService.update(plugin.id,{
                      enabled : plugin.enabled
                  })
                  .then(function(res){
                      $log.debug("updatePlugin",res)
                      // $scope.items.data[$scope.items.data.indexOf(plugin)] = res.data;

                  }).catch(function(err){
                  $log.error("updatePlugin",err)
              })
          }


          function onEditPlugin(item) {
              $uibModal.open({
                  animation: true,
                  ariaLabelledBy: 'modal-title',
                  ariaDescribedBy: 'modal-body',
                  templateUrl: 'js/app/plugins/modals/edit-plugin-modal.html',
                  size : 'lg',
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
                  size : $scope.itemsFetchSize
              }).then(function(response){
                  $scope.items = response;
                  $scope.loading= false;
              })
          }


          /**
           * ------------------------------------------------------------
           * Listeners
           * ------------------------------------------------------------
           */
          $scope.$on("plugin.added",function(){
              _fetchData()
          })

          $scope.$on("plugin.updated",function(ev,plugin){
              _fetchData()
          })


          $scope.$on('user.node.updated',function(node){
              _fetchData()
          })


          _fetchData();

      }
    ])
  ;
}());
