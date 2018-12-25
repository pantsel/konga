/**
 * This file contains all necessary Angular controller definitions for 'frontend.login-history' module.
 *
 * Note that this file should only contain controllers and nothing else.
 */
(function() {
  'use strict';

  angular.module('frontend.upstreams')
    .controller('EditUpstreamController', [
      '$scope', '$rootScope','$stateParams','UserService',
        '$log', '$state','Upstream','MessageService',
      function controller($scope,$rootScope,$stateParams,UserService,
                          $log, $state,Upstream, MessageService ) {

          $scope.upstreamId = $stateParams.id
          $scope.sections = [
              {
                  name : 'Details',
                  icon : 'mdi-information-outline'
              },
              {
                  name : 'Targets',
                  icon : 'mdi-target'
              },
              {
                name : 'Alerts <span class="badge badge-danger pull-right">beta</span>',
                icon : 'mdi-bell'
              }
          ]
          $scope.activeSection = 0;
          $scope.showSection = function(index) {
              $scope.activeSection = index
          }


          function _fetchUpstream() {
              $scope.loading = true;
              Upstream.fetch($scope.upstreamId)
                  .then(function(resp){
                      $log.debug("Fetch upstream =>",resp)
                      $scope.upstream = resp
                      $scope.loading = false;
                      $state.current.data.pageDescription = $scope.upstream.name
                  },function(err){
                  $scope.loading = false;
              })
          }


          _fetchUpstream()


          $scope.$on('user.node.updated',function(node){
              if(UserService.user().node.kong_version == '0-9-x'){
                  $state.go('dashboard')
              }else{
                  $state.go('upstreams')
              }

          })
      }
    ])
  ;
}());
