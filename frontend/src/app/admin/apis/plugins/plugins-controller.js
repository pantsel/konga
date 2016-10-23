/**
 * This file contains all necessary Angular controller definitions for 'frontend.admin.login-history' module.
 *
 * Note that this file should only contain controllers and nothing else.
 */
(function() {
  'use strict';

  angular.module('frontend.admin.apis')
    .controller('AdminApisPluginsController', [
        '_','$scope', '$log', '$state','ApiService','$uibModal','DialogService','InfoService','_api',
      function controller(_,$scope, $log, $state, ApiService, $uibModal,DialogService,InfoService,_api ) {

          $scope.api = _api.data
          $state.current.data.pageName = "Plugins <small>( API : " + ( $scope.api.name || $scope.api.id )+ " )</small>"
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
              ApiService.updatePlugin($scope.api.id,plugin.id,{
                      enabled : plugin.enabled,
                      config : plugin.config
                  })
                  .then(function(res){
                      $log.debug("updatePlugin",res)
                      //res.data.enabled = true
                      //plugin = res.data
                      setTimeout(function(){
                          $scope.plugins[$scope.plugins.indexOf(plugin)] = res.data;
                      },500)

                  }).catch(function(err){
                  $log.error("updatePlugin",err)
              })
          }


          function deletePlugin(plugin) {
              DialogService.prompt(
                  "Delete Plugin","Really want to delete the '" + plugin.name + "' plugin?",
                  ['No don\'t','Yes! delete it'],
                  function accept(){
                      ApiService.deletePlugin($scope.api.id,plugin.id)
                          .then(function(resp){
                              $scope.plugins.splice($scope.plugins.indexOf(plugin),1);
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
                  templateUrl: '/frontend/admin/apis/plugins/modals/edit-plugin-modal.html',
                  size : 'lg',
                  controller: 'EditApiModalController',
                  resolve: {
                      _api : function() {
                          return _api.data
                      },
                      _plugin: function () {
                          return _.cloneDeep(plugin)
                      }
                  }
              });
          }

          function fetchPlugins() {
              ApiService.plugins($scope.api.id)
                  .then(function(res){
                    $log.debug("fetchPlugins",res)
                      $scope.plugins = res.data.data
                  }).catch(function(err){
                  $log.error("fetchPlugins",err)
              })
          }

          function getInfo() {
              InfoService.getInfo()
                  .then(function(res){
                      $log.debug("InfoService.getInfo",res)
                  }).catch(function(err){
                  $log.error("InfoService.getInfo",err)
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
              $scope.plugins.forEach(function(_plugin,i){
                  if(_plugin.id === plugin.id){
                      $scope.plugins[i] = plugin
                  }
              })
          })


          /**
           * -----------------------------------------------------------------
           * Initialization
           * -----------------------------------------------------------------
           */

          fetchPlugins()

      }
    ])
  ;
}());
