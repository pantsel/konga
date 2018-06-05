/**
 * This file contains all necessary Angular controller definitions for 'frontend.admin.login-history' module.
 *
 * Note that this file should only contain controllers and nothing else.
 */
(function() {
  'use strict';

  angular.module('frontend.services')
    .controller('ServiceRoutesController', [
        '_','$scope', '$stateParams','$log', '$state','ServiceService',
        '$uibModal','DialogService','InfoService',
      function controller(_,$scope, $stateParams, $log, $state, ServiceService,
                          $uibModal,DialogService,InfoService ) {



          //$scope.routes = _routes.data;
          /*$scope.onAddRoute = onAddRoute;
          $scope.onEditRoute = onEditRoute;
          $scope.deleteRoute = deleteRoute;
          $scope.updateRoute = updateRoute;
          $scope.toggleRoute = toggleRoute;*/
          $scope.search = ''

          //$log.debug("Routes",$scope.routes.data);

          /**
           * ----------------------------------------------------------------------
           * Functions
           * ----------------------------------------------------------------------
           */


          /*function toggleRoute(route) {
              route.enabled = !route.enabled;
              updateRoute(route);
          }

          function onAddRoute() {
              $uibModal.open({
                  animation: true,
                  ariaLabelledBy: 'modal-title',
                  ariaDescribedBy: 'modal-body',
                  templateUrl: 'js/app/services/views/add-service-route-modal.html',
                  size : 'lg',
                  controller: 'AddServiceRouteModalController',
                  resolve: {
                      _service: function () {
                          return $scope.service
                      },
                      _routes : function() {
                          return RoutesService.load()
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

           function updateRoute(route) {
              RoutesService.update(route.id,{
                      enabled : route.enabled,
                      //config : route.config
                  })
                  .then(function(res){
                      $log.debug("updateRoute",res)
                      $scope.routes.data[$scope.routes.data.indexOf(route)] = res.data;

                  }).catch(function(err){
                  $log.error("updateRoute",err)
              })
          }


          function deleteRoute(route) {
              DialogService.prompt(
                  "Delete Route","Really want to delete the route?",
                  ['No don\'t','Yes! delete it'],
                  function accept(){
                      RoutesService.delete(route.id)
                          .then(function(resp){
                              $scope.routes.data.splice($scope.routes.data.indexOf(route),1);
                          }).catch(function(err){
                          $log.error(err)
                      })
                  },function decline(){})
          }

          function onEditRoute(item) {
              $uibModal.open({
                  animation: true,
                  ariaLabelledBy: 'modal-title',
                  ariaDescribedBy: 'modal-body',
                  templateUrl: 'js/app/routes/modals/edit-route-modal.html',
                  size : 'lg',
                  controller: 'EditRouteController',
                  resolve: {
                      _route: function () {
                          return _.cloneDeep(item)
                      },
                      _schema: function () {
                          return RoutesService.schema(item.name)
                      }
                  }
              });
          }*/

          function fetchRoutes() {
                //RoutesService.load({service_id:$stateParams.service_id})
                ServiceService.routes($stateParams.service_id)
                    .then(function(res){
                        $scope.routes = res.data
                    })
          }
          
          fetchRoutes();

          /**
           * ------------------------------------------------------------
           * Listeners
           * ------------------------------------------------------------
           */
          $scope.$on("route.added",function(){
              fetchRoutes()
          })

          $scope.$on("route.updated",function(ev,route){
              fetchRoutes()
          })


      }
    ])
  ;
}());
