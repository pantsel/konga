/**
 * This file contains all necessary Angular controller definitions for 'frontend.admin.login-history' module.
 *
 * Note that this file should only contain controllers and nothing else.
 */
(function() {
  'use strict';

  angular.module('frontend.plugins')
    .controller('PluginsController', [
        '_','$scope', '$log', '$state','ApiService','PluginsService',
        '$uibModal','DialogService','InfoService','_plugins',
      function controller(_,$scope, $log, $state, ApiService, PluginsService,
                          $uibModal,DialogService,InfoService,_plugins ) {

          //$scope.api = _api.data
          //$state.current.data.pageName = "Plugins <small>( API : " + ( $scope.api.name || $scope.api.id )+ " )</small>"
          $log.debug("Plugins",_plugins)
          $scope.plugins = _plugins.data
          $scope.onEditPlugin = onEditPlugin
          $scope.deletePlugin = deletePlugin
          $scope.updatePlugin = updatePlugin
          $scope.search = ''

          /**
           * ----------------------------------------------------------------------
           * Functions
           * ----------------------------------------------------------------------
           */

           function updatePlugin(plugin) {
              PluginsService.update(plugin.id,{
                      enabled : plugin.enabled,
                      //config : plugin.config
                  })
                  .then(function(res){
                      $log.debug("updatePlugin",res)
                      $scope.plugins.data[$scope.plugins.data.indexOf(plugin)] = res.data;

                  }).catch(function(err){
                  $log.error("updatePlugin",err)
              })
          }


          function deletePlugin(plugin) {
              DialogService.prompt(
                  "Delete Plugin","Really want to delete the plugin?",
                  ['No don\'t','Yes! delete it'],
                  function accept(){
                      PluginsService.delete(plugin.id)
                          .then(function(resp){
                              $scope.plugins.data.splice($scope.plugins.data.indexOf(plugin),1);
                          }).catch(function(err){
                          $log.error(err)
                      })
                  },function decline(){})
          }

          function onEditPlugin(plugin) {
              $uibModal.open({
                  animation: true,
                  ariaLabelledBy: 'modal-title',
                  ariaDescribedBy: 'modal-body',
                  templateUrl: '/frontend/plugins/modals/edit-plugin-modal.html',
                  size : 'lg',
                  controller: 'EditPluginController',
                  resolve: {
                      _plugin: function () {
                          return _.cloneDeep(plugin)
                      },
                      _schema: function () {
                          return PluginsService.schema(plugin.name)
                      }
                  }
              });
          }

          function fetchPlugins() {
                PluginsService.load()
                    .then(function(res){
                        $scope.plugins = res.data
                    })
          }


          /**
           * ------------------------------------------------------------
           * Listeners
           * ------------------------------------------------------------
           */
          $scope.$on("plugin.added",function(){
              fetchPlugins()
          })

          $scope.$on("plugin.updated",function(ev,plugin){
              fetchPlugins()
          })


      }
    ])
  ;
}());
