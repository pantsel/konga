/**
 * This file contains all necessary Angular controller definitions for 'frontend.login-history' module.
 *
 * Note that this file should only contain controllers and nothing else.
 */
(function() {
  'use strict';

  angular.module('frontend.apis')
    .controller('ManageApiPluginsController', [
      '_','$scope', '$rootScope','$log',
        '$state','ApiService','MessageService','DialogService',
        'KongPluginsService','PluginsService','$uibModal','_api',
        '_plugins','_info',
      function controller(_,$scope,$rootScope, $log,
                          $state, ApiService, MessageService, DialogService,
                          KongPluginsService,PluginsService, $uibModal,_api,
                          _plugins,_info ) {

          var info = _info.data
          var plugins_available = info.plugins.available_on_server
          var pluginOptions = new KongPluginsService().pluginOptions()

          $state.current.data.pageName = "Manage API Plugins <small>( API : " + ( _api.data.name || _api.data.id )+ " )</small>"

          $scope.pluginOptions = pluginOptions
          $scope.pluginGroups = new KongPluginsService().pluginGroups()
          $scope.activeGroup = 'Authentication'
          $scope.setActiveGroup = setActiveGroup
          $scope.filterGroup = filterGroup
          $scope.onAddPlugin = onAddPlugin
          $scope.onEditPlugin = onEditPlugin
          $scope.removePlugin = removePlugin



          $scope.pluginGroups.forEach(function(group){
              for(var key in group.plugins) {
                  if(!plugins_available[key]) delete group.plugins[key]
              }
          })


          /**
           * -------------------------------------------------------------
           * Functions
           * -------------------------------------------------------------
           */

          function removePlugin(plugin) {
              DialogService.prompt(
                  "Remove Plugin","Really want to remove '" + plugin.name + "' plugin from " + _api.data.name + " API?",
                  ['No','Yes! remove it'],
                  function accept(){
                      ApiService.deletePlugin( _api.data.id,plugin.id)
                          .then(function(resp){
                              fetchPlugins()
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
                  templateUrl: '/frontend/apis/plugins/modals/edit-plugin-modal.html',
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
                  templateUrl: '/frontend/plugins/modals/add-plugin-modal.html',
                  size : 'lg',
                  controller: 'AddPluginController',
                  resolve: {
                      _api : function() {
                          return _api.data
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

          function findPlugin(plugins,name) {
              for(var i=0; i < plugins.length; i ++) {
                  if(plugins[i].name ===  name) {
                      return plugins[i]
                  }
              }
              return undefined
          }

          function syncPlugins(added) {

              var addedMap = added.map(function(item){
                  return item.name
              })

              $scope.pluginGroups.forEach(function(group){
                  for(var key in group.plugins) {
                      if(addedMap.indexOf(key) > -1) {
                          group.plugins[key].isAdded = true
                          var plugin = findPlugin(added,key);
                          if(plugin) {
                              for(var _key in plugin){
                                  group.plugins[key][_key] = plugin[_key]
                              }
                          }
                      }else{
                          group.plugins[key].isAdded = false
                      }
                  }
              })
          }


          function fetchPlugins() {
              ApiService.plugins(_api.data.id)
                  .then(function(res){
                      $log.debug("ApiService.plugins",res)
                      syncPlugins(res.data.data)
                  }).catch(function(err){
                  $log.err("ApiService.plugins",err)
              })
          }

          // Listeners
          $scope.$on('plugin.added',function(){
              fetchPlugins()
          })

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

          // Init
          syncPlugins(_plugins.data.data)


      }
    ])
  ;
}());
