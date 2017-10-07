/**
 * This file contains all necessary Angular controller definitions for 'frontend.admin.login-history' module.
 *
 * Note that this file should only contain controllers and nothing else.
 */
(function() {
  'use strict';

  angular.module('frontend.consumers')
    .controller('ConsumerApisController', [
      '_','$scope', '$stateParams','$log', '$state','$uibModal','ConsumerService','ApiModel','ListConfig','UserService',
      function controller(_,$scope,$stateParams, $log, $state, $uibModal,ConsumerService,ApiModel, ListConfig,UserService) {


          ApiModel.setScope($scope, false, 'items', 'itemCount');
          $scope = angular.extend($scope, angular.copy(ListConfig.getConfig('api',ApiModel)));
          $scope.user = UserService.user();
          $scope.getPlugins = getPlugins;


          function getPlugins(api) {

              return _.map(api.plugins.data,function(item){
                  return item.name;
              }).join(", ") || "N/A";
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


      }
    ]);
}());
