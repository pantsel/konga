/**
 * This file contains all necessary Angular controller definitions for 'frontend.admin.login-history' module.
 *
 * Note that this file should only contain controllers and nothing else.
 */
(function () {
  'use strict';

  angular.module('frontend.services')
    .controller('ServiceRoutesController', [
      '_', '$scope', '$stateParams', '$log', '$state', 'ServiceService',
      '$uibModal', 'DialogService', 'InfoService', 'RoutesService','AuthService',
      function controller(_, $scope, $stateParams, $log, $state, ServiceService,
                          $uibModal, DialogService, InfoService, RoutesService,AuthService) {



        //$scope.routes = _routes.data;
        $scope.onAddRoute = onAddRoute;
        $scope.onEditRoute = onEditRoute;
        $scope.deleteRoute = deleteRoute;
        $scope.updateRoute = updateRoute;
        $scope.toggleAttribute = toggleAttribute;
        $scope.canCreate = AuthService.hasPermission('routes','create');
        $scope.canEdit = AuthService.hasPermission('routes','edit');
        $scope.canDelete = AuthService.hasPermission('routes','delete');
        $scope.search = ''

        //$log.debug("Routes",$scope.routes.data);

        /**
         * ----------------------------------------------------------------------
         * Functions
         * ----------------------------------------------------------------------
         */


        function toggleAttribute(route,attr, enabled) {
          var obj = {};
          obj[attr] = !enabled;
          updateRoute(route,obj);
        }

        function onAddRoute() {
          var modalInstance = $uibModal.open({
            animation: true,
            ariaLabelledBy: 'modal-title',
            ariaDescribedBy: 'modal-body',
            templateUrl: 'js/app/routes/views/route-modal.html',
            size: 'lg',
            controller: 'AddRouteModalController',
            resolve: {
              _service: function () {
                return $scope.service;
              }
            }
          });

          modalInstance.result.then(function close(data) {

          }, function dismiss(data) {
            if (data) {
              fetchRoutes();
            }
          });
        }

        function updateRoute(route,data) {

          RoutesService.update(route.id, data)
            .then(function (res) {
              $log.debug("updateRoute", res)
              $scope.routes.data[$scope.routes.data.indexOf(route)] = res.data;

            }).catch(function (err) {
            $log.error("updateRoute", err)
          })
        }


        function deleteRoute(route) {
          DialogService.confirm(
            "Delete Route", "Really want to delete the route?",
            ['No don\'t', 'Yes! delete it'],
            function accept() {
              RoutesService.delete(route)
                .then(function (resp) {
                  $scope.routes.data.splice($scope.routes.data.indexOf(route), 1);
                }).catch(function (err) {
                $log.error(err)
              })
            }, function decline() {
            })
        }

        function onEditRoute(item) {
          var modalInstance = $uibModal.open({
            animation: true,
            ariaLabelledBy: 'modal-title',
            ariaDescribedBy: 'modal-body',
            templateUrl: 'js/app/routes/views/route-modal.html',
            size: 'lg',
            controller: 'RouteDetailsController',
            resolve: {
              _route: function () {
                return _.cloneDeep(item)
              }
            }
          });

          modalInstance.result.then(function (data) {

          }, function (data) {
            if(data) {
              fetchRoutes();
            }
          });
        }

        function fetchRoutes() {
          ServiceService.routes($stateParams.service_id)
            .then(function (res) {
              $scope.routes = res.data;
            });
        }

        fetchRoutes();

        /**
         * ------------------------------------------------------------
         * Listeners
         * ------------------------------------------------------------
         */
        $scope.$on("route.added", function () {
          fetchRoutes()
        })

        $scope.$on("route.updated", function (ev, route) {
          fetchRoutes()
        })


      }
    ])
  ;
}());
