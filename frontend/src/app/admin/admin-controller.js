/**
 * This file contains all necessary Angular controller definitions for 'frontend.admin.login-history' module.
 *
 * Note that this file should only contain controllers and nothing else.
 */
(function() {
  'use strict';

  angular.module('frontend.admin.info')
    .controller('AdminController', [
      '$scope', '$log', '$state','InfoService','_nodes',
      function controller($scope, $log, $state,InfoService,_nodes) {


          $scope.node = _nodes[0];

          if(!$scope.node) {
              $scope.alert = {
                  msg : 'You have to setup and activate a node in order to connect to Kong\'s admin API. You can do that in <a href="/admin/settings"><strong>settings</strong></a>',
                  type : 'warning'
              }
          }

          $scope.closeAlert = function() {
              if($scope.alert) delete $scope.alert
          }

          $scope.go = $state.go.bind($state);

          function init() {

              if(!$scope.node) {
                  $scope.connectionMsg = 'No node is set up or activated.'
              }else{
                  fetchInfo()
              }
          }

          function fetchInfo() {
              $scope.busy = true
              $scope.connectionMsg = 'Connecting to Kong Admin API (' + $scope.node.kong_admin_ip + ':' + $scope.node.kong_admin_port + ')'
              InfoService.getInfo()
                  .then(function(data){
                      $scope.busy = false
                      $scope.info = data.data
                  }).catch(function(err){
                  $scope.busy = false
                  $scope.connectionMsg = '<span class="text-danger">Connection to ' + $scope.node.kong_admin_ip + ':' + $scope.node.kong_admin_port + ' failed!</span><br><br>Make sure that the node you provided is <span class="text-danger">accessible</span> and <span class="text-danger">activated</span>.<br><br><a href="/admin/settings"><strong>Go to settings</strong></a>'
              })
          }

          init()
      }
    ])
  ;
}());
