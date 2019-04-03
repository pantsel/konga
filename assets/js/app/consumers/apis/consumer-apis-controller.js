/**
 * This file contains all necessary Angular controller definitions for 'frontend.admin.login-history' module.
 *
 * Note that this file should only contain controllers and nothing else.
 */
(function() {
  'use strict';

  angular.module('frontend.consumers')
    .controller('ConsumerApisController', [
      '_','$scope', '$stateParams','$log', '$state','$uibModal','DialogService',
        'ConsumerService','ApiModel','ListConfig','UserService','PluginsService',
      function controller(_,$scope,$stateParams, $log, $state, $uibModal,DialogService,
                          ConsumerService,ApiModel, ListConfig,UserService,PluginsService) {


          ApiModel.setScope($scope, false, 'items', 'itemCount');
          $scope = angular.extend($scope, angular.copy(ListConfig.getConfig('consumerApi',ApiModel)));
          $scope.user = UserService.user();
          $scope.getGeneralPlugins = getGeneralPlugins;
          $scope.getConsumerPlugins = getConsumerPlugins;
          $scope.onEditPlugin = onEditPlugin;
          $scope.deletePlugin = deletePlugin;
          $scope.onAddPlugin = onAddPlugin;
          $scope.isAccessControlled = isAccessControlled;
          $scope.needsAuth = needsAuth;
          $scope.isOpen = isOpen;



          function isOpen(api) {
              return !isAccessControlled(api) && !needsAuth(api);
          }

          function isAccessControlled(api) {
              return _.filter(api.plugins.data,function(item){
                  return item.name === 'acl' && item.enabled;
              }).length > 0;
          }


          function needsAuth(api) {
              var authPluginNames = ['basic-auth','key-auth','jwt-auth','oauth2','hmac-auth'];
              return _.filter(api.plugins.data,function(item){
                      return authPluginNames.indexOf(item.name) > -1 && item.enabled;
                  }).length > 0;
          }

          function getGeneralPlugins(api) {

              return _.filter(api.plugins.data,function(item){
                  return !item.consumer_id;
              });
          }


          function getConsumerPlugins(api) {

              return _.filter(api.plugins.data,function(item){
                  return item.consumer_id && item.consumer_id === $stateParams.id;
              });
          }


          function onAddPlugin(api) {
              var modalInstance = $uibModal.open({
                  animation: true,
                  ariaLabelledBy: 'modal-title',
                  ariaDescribedBy: 'modal-body',
                  templateUrl: 'js/app/plugins/modals/add-consumer-plugin-modal.html',
                  size : 'lg',
                  controller: 'AddPluginModalController',
                  resolve: {
                      _context : function() {
                        return [
                          {
                            name: "consumer",
                            data: $scope.consumer
                          },
                          {
                            name: "api",
                            data: api
                          },
                        ]
                      },
                      _plugins : function() {
                          return PluginsService.load();
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
                              return InfoService.getInfo();
                          }
                      ]
                  }
              });

              modalInstance.result.then(function (data) {

              }, function () {
                  $log.info('Modal dismissed at: ' + new Date());
              });
          }

          function onEditPlugin(item) {
              var modalInstance = $uibModal.open({
                  animation: true,
                  ariaLabelledBy: 'modal-title',
                  ariaDescribedBy: 'modal-body',
                  templateUrl: 'js/app/plugins/modals/edit-plugin-modal.html',
                  size : 'lg',
                  controller: 'EditPluginController',
                  resolve: {
                      _plugin: function () {
                          return _.cloneDeep(item);
                      },
                      _schema: function () {
                          return PluginsService.schema(item.name);
                      }
                  }
              });

              modalInstance.result.then(function (data) {
                  if(data) {
                      Object.keys(data.data).forEach(function(key){
                          item[key] = data.data[key];
                      });

                  }
              }, function () {
                  $log.info('Modal dismissed at: ' + new Date());
              });
          }

          function deletePlugin(api,plugin) {
              DialogService.confirm(
                  "Delete Plugin","Really want to delete the plugin?",
                  ['No don\'t','Yes! delete it'],
                  function accept(){
                      PluginsService.delete(plugin.id)
                          .then(function(resp){
                              api.plugins.data.splice(api.plugins.data.indexOf(plugin),1);
                          }).catch(function(err){
                          $log.error(err);
                      });
                  },function decline(){});
          }

          function fetchApis() {
              ConsumerService.listApis($stateParams.id)
                  .then(function(res){
                      $scope.items = res.data;

                  });
          }

          fetchApis();


          /**
           * ------------------------------------------------------------
           * Listeners
           * ------------------------------------------------------------
           */
          $scope.$on("api.added",function(){
              fetchApis();
          });


          $scope.$on('plugin.added',function(){
              fetchApis();
          });


          // $scope.$on("plugin.updated",function(ev,plugin){
          //     fetchApis();
          // });


      }
    ]);
}());
