(function() {
  'use strict';

  angular.module('frontend.routes')
    .controller('RoutesController', [
      '$scope','$rootScope', '$log', '$state','RouteService','ListConfig','RouteModel',
        'UserService','$uibModal','DialogService','RouteHCModel',
      function controller($scope,$rootScope, $log, $state, RouteService,ListConfig,RouteModel,
                          UserService,$uibModal,DialogService,RouteHCModel ) {

          RouteModel.setScope($scope, false, 'items', 'itemCount');
          $scope = angular.extend($scope, angular.copy(ListConfig.getConfig('route',RouteModel)));
          $scope.user = UserService.user()
          //$scope.toggleStripRequestPathOrUri = toggleStripRequestPathOrUri
          //$scope.isRequestPathOrUriStripped = isRequestPathOrUriStripped
          $scope.openAddRouteModal = openAddRouteModal
          $scope.updateRoute = updateRoute


          /**
           * -----------------------------------------------------------------------------------------------------------
           * Internal Functions
           * -----------------------------------------------------------------------------------------------------------
           */

          function updateRoute(id,data) {

              $scope.loading = true

              RouteModel.update(id,data)
                  .then(function(res){
                      $log.debug("Update Route: ",res)
                      $scope.loading = false
                      _fetchData()
                  }).catch(function(err){
                  $log.error("Update Route: ",err)
                  $scope.loading = false;
              });

          }

          /*function toggleStripRequestPathOrUri(route) {
			  route.strip_path=!route.strip_path;

              $scope.updateRoute(route.id,{
                  strip_path : route.strip_path
              })
          }


          function isRequestPathOrUriStripped(route) {
              return route.strip_path
          }*/


          function openAddRouteModal() {
              $uibModal.open({
                  animation: true,
                  ariaLabelledBy: 'modal-title',
                  ariaDescribedBy: 'modal-body',
                  templateUrl: 'js/app/routes/views/route-modal.html',
                  controller: 'AddRouteModalController',
                  controllerAs: '$ctrl',
                  size: 'lg'
              });
          }


          function _fetchData(){
              $scope.loading = true;
              RouteModel.load({
                  size : $scope.itemsFetchSize
              }).then(function(response){
                  $scope.items = response;
                  $scope.loading= false;
              })

          }


          function loadRouteHealthChecks(callback) {
              RouteHCModel.load({
                  limit  : $scope.items.total
              }).then(function(response){
                  $scope.healthChecks = response
                  callback(null,response);
              })
          }


          function assignRouteHealthChecks(routes, hcs) {
              routes.forEach(function (route) {

                  hcs.forEach(function (hc) {
                      if (route.id == hc.route_id) {
                          route.health_checks = hc
                      }
                  })
              })
          }

          function onFilteredItemsChanged(routes) {

              if(!$scope.healthChecks) {
                  loadRouteHealthChecks(function(err,hcs){
                      if(hcs) {
                          assignRouteHealthChecks(routes, hcs);
                      }
                  })
              }else{
                  assignRouteHealthChecks(routes, $scope.healthChecks);
              }

          }


          /**
           * -----------------------------------------------------------------------------------------------------------
           * Watchers and Listeners
           * -----------------------------------------------------------------------------------------------------------
           */

          $scope.$on('route.health_checks',function(event,data){
              $scope.items.data.forEach(function(route){
                  if(route.health_checks && data.hc_id == route.health_checks.id) {
                      route.health_checks.data = data
                      $scope.$apply()
                  }
              })
          })

          $scope.$on('route.created',function(){
              _fetchData()
          })


          $scope.$on('user.node.updated',function(node){
              _fetchData()
          })


          // Assign Route health checks to filtered items only
          // so that the DOM is not overencumbered
          // when dealing with large datasets

          $scope.$watch('filteredItems',function(newValue,oldValue){

              if(newValue && (JSON.stringify(newValue) !== JSON.stringify(oldValue))){
                  onFilteredItemsChanged(newValue)
              }
          })



          // Init

          _fetchData();

      }
    ])
  ;
}());
