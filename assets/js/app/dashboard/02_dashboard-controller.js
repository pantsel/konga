/**
 * This file contains all necessary Angular controller definitions for 'frontend.admin.login-history' module.
 *
 * Note that this file should only contain controllers and nothing else.
 */
(function() {
  'use strict';

  angular.module('frontend.dashboard')
    .controller('DashboardController', [
      '$scope', '$rootScope','$log', '$state','$q','InfoService',
      function controller($scope,$rootScope, $log, $state,$q,InfoService) {


          $scope.closeAlert = function() {
              if($scope.alert) delete $scope.alert
          }

          $scope.isEnabled = function(name) {
            for(var key in $scope.info.plugins.enabled_in_cluster) {
                if(name === $scope.info.plugins.enabled_in_cluster[key]) {
                    return true
                }
            }

            return false
          }


          function drawCharts() {
              $scope.data = {
                  server : {
                      labels : [
                          'Accepted',
                          'Active',
                          'Handled',
                          'Reading',
                          'Waiting',
                          'Writing',
                          'Total Requests'
                      ],
                      options: {
                          scales: {
                              xAxes: [{
                                  ticks: {
                                      autoSkip: false,
                                      maxRotation: 0,
                                      minRotation: 0
                                  }
                              }]
                          }
                      },
                      series : ['Connections'],
                      data : [
                          $scope.status.server.connections_accepted,
                          $scope.status.server.connections_active,
                          $scope.status.server.connections_handled,
                          $scope.status.server.connections_reading,
                          $scope.status.server.connections_waiting,
                          $scope.status.server.connections_writing,
                          $scope.status.server.total_requests,
                      ]
                  },
                  timers : {
                      labels : [
                          'Pending',
                          'Running'
                      ],
                      options : {
                          //title: {
                          //    display: true,
                          //    text: 'timers'
                          //},
                      },
                      series : ['Timers'],
                      data : [
                          $scope.info.timers.pending,
                          $scope.info.timers.running
                      ]
                  },
                  database : {
                      labels : [
                          'ACLs',
                          'APIs',
                          'Consumers',
                          'Nodes',
                          'Plugins'
                      ],
                      options: {
                          //scales: {
                          //    xAxes: [{
                          //        ticks: {
                          //            autoSkip: false,
                          //            maxRotation: 0,
                          //            minRotation: 0
                          //        }
                          //    }]
                          //}
                      },
                      series : ['database'],
                      data : [
                          $scope.status.database.acls,
                          $scope.status.database.apis,
                          $scope.status.database.consumers,
                          $scope.status.database.nodes,
                          $scope.status.database.plugins
                      ]
                  }
              }
          }

          var status = InfoService
              .nodeStatus()
              .then(function(resp){
                  $scope.status = resp.data
              })
          var info = InfoService
              .getInfo()
              .then(function(resp){
                  $scope.info = resp.data
              })
          var clusters = InfoService
              .clusterStatus()
              .then(function(resp){
                  $scope.clusters = resp.data
              })



          function fetchData() {
              $scope.loading = true
              $q
                  .all([status, info])
                  .finally(
                      function onFinally() {

                          $log.debug("status",$scope.status)
                          $log.debug("info",$scope.info)
                          $log.debug("clusters",$scope.clusters)
                          $scope.loading = false

                          if($scope.status && $scope.info) {
                              drawCharts();
                          }else{
                              $scope.error = true
                              $scope.alert = {
                                  msg : 'You have to setup and activate a node in order to connect to Kong\'s admin API. You can do that in <a href="/admin/settings"><strong>settings</strong></a>',
                                  type : 'warning'
                              }
                          }

                      })
          }

          /**
           * Init UI
           */
          fetchData();



          $scope.$on('kong.node.updated',function(node){
              fetchData();
          })
      }
    ])
  ;
}());
