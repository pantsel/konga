/**
 * This file contains all necessary Angular controller definitions for 'frontend.admin.login-history' module.
 *
 * Note that this file should only contain controllers and nothing else.
 */
(function () {
  'use strict';

  angular.module('frontend.consumers')
    .controller('ConsumerServicesController', [
      '_', '$scope', '$q','$stateParams', '$log', '$state', '$uibModal', 'DialogService',
      'ConsumerService', 'ApiModel', 'ListConfig', 'UserService', 'PluginsService','ServiceModel',
      function controller(_, $scope,$q, $stateParams, $log, $state, $uibModal, DialogService,
                          ConsumerService, ApiModel, ListConfig, UserService, PluginsService,ServiceModel) {


        ServiceModel.setScope($scope, false, 'items', 'itemCount');
        $scope = angular.extend($scope, angular.copy(ListConfig.getConfig('service', ServiceModel)));
        $scope.user = UserService.user()

        $scope.consumerGroups = [];
        $scope.accessControlledServiceIds = [];
        $scope.aclsServiceIds = [];
        $scope.aclPlugins = [];
        $scope.services = [];

        $scope.whiteListedServiceIds = [];
        $scope.blackListedServiceIds = [];


        // Get all services
        // Find the ones that have acl plugins
        // Filter out the services the consumer cannot access



        fetchConsumerAcls();


        function fetchConsumerAcls() {
          ConsumerService.fetchAcls($stateParams.id)
            .then(function (res) {
              $scope.consumerGroups = _.map(res.data.data, item => item.group);
              console.log("FETCH CONSUMER GROUPS", $scope.consumerGroups)
              if ($scope.consumerGroups.length) {
                fetchAclPlugins();
              }
            }).catch(function (err) {

          })
        }

        function fetchAclPlugins() {
          PluginsService.load({
            name: 'acl',
            enabled: true
          }).then(function (res) {
            $scope.aclPlugins = res.data.data;
            console.log("GOT ACL PLUGINS", $scope.aclPlugins)

            _.forEach($scope.aclPlugins, item => {
              if (item.service_id && $scope.accessControlledServiceIds.indexOf(item.service_id) < 0) {
                $scope.accessControlledServiceIds.push(item.service_id);
              }
            });

            console.log("***************  ACCESS CONTROLLED SERVICE IDS =>", $scope.accessControlledServiceIds);


            $scope.whiteListedServiceIds = _.map(_.filter(res.data.data, item => {
              return _.intersection(item.config.whitelist, $scope.consumerGroups).length >= 1
            }), o => o.service_id);

            console.log("*************** WHITELISTED SERVICE IDS", $scope.whiteListedServiceIds)


            $scope.blackListedServiceIds = _.map(_.filter(res.data.data, item => {
              return _.intersection(item.config.blacklist, $scope.consumerGroups).length >= 1
            }), o => o.service_id);

            console.log("***************  BLACKLISTED SERVICE IDS", $scope.blackListedServiceIds)


            // if($scope.accessControlledServiceIds.length) {
            //   loadServices();
            // }

            _fetchData();
          }).catch(function (err) {

          })
        }
        
        
        function loadServices() {

          var fns = [];
          $scope.accessControlledServiceIds.forEach(item => {
            console.log("!!!!!!!!!!!!!!!!!!!!!!!", item);
            fns.push(ServiceModel.fetch(item)
              .then(
                function onSuccess(response) {
                  return response
                }))
          })

          $q
            .all(fns)
            .then(function (res) {
              $scope.services = res;
              console.log("GET CONSUMER SERVICES =>", $scope.services);
            })
            .finally(
              function onFinally(res) {


              }
            )
        }


        function hasAccess(service) {

        }


        function _fetchData() {
          $scope.loading = true;
          ServiceModel.load({
            size: $scope.itemsFetchSize
          }).then(function (response) {
            $scope.items = response;

            $scope.items.data = _.filter(response.data, item =>{
              return $scope.accessControlledServiceIds.indexOf(item.id) < 0 || ($scope.whiteListedServiceIds.indexOf(item.id) > -1 && $scope.blackListedServiceIds.indexOf(item.id) < 0);
            });


            console.log("############################ Services =>", $scope.items);

            $scope.loading = false;
          })

        }

        // $scope.getGeneralPlugins = getGeneralPlugins;
        // $scope.getConsumerPlugins = getConsumerPlugins;
        // $scope.onEditPlugin = onEditPlugin;
        // $scope.deletePlugin = deletePlugin;
        // $scope.onAddPlugin = onAddPlugin;
        // $scope.isAccessControlled = isAccessControlled;
        // $scope.needsAuth = needsAuth;
        // $scope.isOpen = isOpen;
        //
        //
        //
        // function isOpen(api) {
        //     return !isAccessControlled(api) && !needsAuth(api);
        // }
        //
        // function isAccessControlled(api) {
        //     return _.filter(api.plugins.data,function(item){
        //         return item.name === 'acl' && item.enabled;
        //     }).length > 0;
        // }
        //
        //
        // function needsAuth(api) {
        //     var authPluginNames = ['basic-auth','key-auth','jwt-auth','oauth2','hmac-auth'];
        //     return _.filter(api.plugins.data,function(item){
        //             return authPluginNames.indexOf(item.name) > -1 && item.enabled;
        //         }).length > 0;
        // }
        //
        // function getGeneralPlugins(api) {
        //
        //     return _.filter(api.plugins.data,function(item){
        //         return !item.consumer_id;
        //     });
        // }
        //
        //
        // function getConsumerPlugins(api) {
        //
        //     return _.filter(api.plugins.data,function(item){
        //         return item.consumer_id && item.consumer_id === $stateParams.id;
        //     });
        // }
        //
        //
        // function onAddPlugin(api) {
        //     var modalInstance = $uibModal.open({
        //         animation: true,
        //         ariaLabelledBy: 'modal-title',
        //         ariaDescribedBy: 'modal-body',
        //         templateUrl: 'js/app/plugins/modals/add-consumer-plugin-modal.html',
        //         size : 'lg',
        //         controller: 'AddPluginModalController',
        //         resolve: {
        //             _context : function() {
        //               return [
        //                 {
        //                   name: "consumer",
        //                   data: $scope.consumer
        //                 },
        //                 {
        //                   name: "api",
        //                   data: api
        //                 },
        //               ]
        //             },
        //             _plugins : function() {
        //                 return PluginsService.load();
        //             },
        //             _info: [
        //                 '$stateParams',
        //                 'InfoService',
        //                 '$log',
        //                 function resolve(
        //                     $stateParams,
        //                     InfoService,
        //                     $log
        //                 ) {
        //                     return InfoService.getInfo();
        //                 }
        //             ]
        //         }
        //     });
        //
        //     modalInstance.result.then(function (data) {
        //
        //     }, function () {
        //         $log.info('Modal dismissed at: ' + new Date());
        //     });
        // }
        //
        // function onEditPlugin(item) {
        //     var modalInstance = $uibModal.open({
        //         animation: true,
        //         ariaLabelledBy: 'modal-title',
        //         ariaDescribedBy: 'modal-body',
        //         templateUrl: 'js/app/plugins/modals/edit-plugin-modal.html',
        //         size : 'lg',
        //         controller: 'EditPluginController',
        //         resolve: {
        //             _plugin: function () {
        //                 return _.cloneDeep(item);
        //             },
        //             _schema: function () {
        //                 return PluginsService.schema(item.name);
        //             }
        //         }
        //     });
        //
        //     modalInstance.result.then(function (data) {
        //         if(data) {
        //             Object.keys(data.data).forEach(function(key){
        //                 item[key] = data.data[key];
        //             });
        //
        //         }
        //     }, function () {
        //         $log.info('Modal dismissed at: ' + new Date());
        //     });
        // }
        //
        //
        // function deletePlugin(api,plugin) {
        //     DialogService.prompt(
        //         "Delete Plugin","Really want to delete the plugin?",
        //         ['No don\'t','Yes! delete it'],
        //         function accept(){
        //             PluginsService.delete(plugin.id)
        //                 .then(function(resp){
        //                     api.plugins.data.splice(api.plugins.data.indexOf(plugin),1);
        //                 }).catch(function(err){
        //                 $log.error(err);
        //             });
        //         },function decline(){});
        // }
        //
        // function fetchApis() {
        //     ConsumerService.listApis($stateParams.id)
        //         .then(function(res){
        //             $scope.items = res.data;
        //
        //         });
        // }
        //
        // fetchApis();


        /**
         * ------------------------------------------------------------
         * Listeners
         * ------------------------------------------------------------
         */
        // $scope.$on("api.added",function(){
        //     fetchApis();
        // });
        //
        //
        // $scope.$on('plugin.added',function(){
        //     fetchApis();
        // });


        // $scope.$on("plugin.updated",function(ev,plugin){
        //     fetchApis();
        // });


      }
    ]);
}());
