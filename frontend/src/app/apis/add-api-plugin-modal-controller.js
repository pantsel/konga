/**
 * This file contains all necessary Angular controller definitions for 'frontend.admin.login-history' module.
 *
 * Note that this file should only contain controllers and nothing else.
 */
(function() {
    'use strict';

    angular.module('frontend.apis')
        .controller('AddApiPluginModalController', [
            '_','$scope', '$rootScope','$log',
            '$state','ApiService','MessageService','DialogService',
            'KongPluginsService','PluginsService','$uibModal','$uibModalInstance',
            '_api','_plugins',
            function controller(_,$scope,$rootScope, $log,
                                $state, ApiService, MessageService, DialogService,
                                KongPluginsService,PluginsService, $uibModal,$uibModalInstance,
                                _api,_plugins ) {


                var pluginOptions = new KongPluginsService().pluginOptions()

                $scope.api = _api
                $scope.pluginOptions = pluginOptions

                new KongPluginsService().makePluginGroups().then(function(groups){
                    $scope.pluginGroups = groups
                    $log.debug("Plugin Groups",$scope.pluginGroups)
                })

                $scope.activeGroup = 'Authentication'
                $scope.setActiveGroup = setActiveGroup
                $scope.filterGroup = filterGroup
                $scope.onAddPlugin = onAddPlugin
                $scope.close = function() {
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
                    $uibModal.open({
                        animation: true,
                        ariaLabelledBy: 'modal-title',
                        ariaDescribedBy: 'modal-body',
                        templateUrl: '/frontend/plugins/modals/add-plugin-modal.html',
                        size : 'lg',
                        controller: 'AddPluginController',
                        resolve: {
                            _api : function() {
                                return $scope.api
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




                function fetchPlugins() {
                    PluginsService.load()
                        .then(function(res){

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



            }
        ])
    ;
}());
