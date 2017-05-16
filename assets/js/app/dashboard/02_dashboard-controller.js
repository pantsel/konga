/**
 * This file contains all necessary Angular controller definitions for 'frontend.admin.login-history' module.
 *
 * Note that this file should only contain controllers and nothing else.
 */
(function() {
  'use strict';

  angular.module('frontend.dashboard')
    .controller('DashboardController', [
      '$scope', '$rootScope','$log', '$state','$q','InfoService','$timeout',
      function controller($scope,$rootScope, $log, $state,$q,InfoService,$timeout) {


          var loadTime = $rootScope.KONGA_CONFIG.info_polling_interval,
              errorCount = 0,
              hasInitiallyLoaded = false,
              loadPromise;

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






          function fetchData() {
              if(!hasInitiallyLoaded) $scope.loading = true
              $log.debug("DashboardController:fetchData() called")

              var status = InfoService
                  .nodeStatus()
                  .then(function(resp){
                      $scope.status = resp.data
                      $log.debug("DashboardController:fetchData:status",$scope.status)
                  })
              var info = InfoService
                  .getInfo()
                  .then(function(resp){
                      $scope.info = resp.data
                      $log.debug("DashboardController:fetchData:info",$scope.info)
                  })
              var clusters = InfoService
                  .clusterStatus()
                  .then(function(resp){
                      $scope.clusters = resp.data
                      $log.debug("DashboardController:fetchData:clusters",$scope.clusters)
                  })

              $q
                  .all([status, info, clusters])
                  .finally(
                      function onFinally() {
                          $scope.loading = false
                          hasInitiallyLoaded = true
                          if($scope.status && $scope.info) {
                              $scope.error = false
                              drawCharts();
                              errorCount = 0;
                              if(loadTime) nextLoad();
                          }else{
                              nextLoad(++errorCount * 2 * loadTime);
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


          

          var cancelNextLoad = function() {
              $timeout.cancel(loadPromise);
          };

          var nextLoad = function(mill) {
              mill = mill || loadTime;

              // Make sure the last timeout is cleared before starting a new one
              cancelNextLoad();
              loadPromise = $timeout(fetchData, mill);
          };

          // clear the timeout when the view is destroyed
          $scope.$on('$destroy', function() {
              cancelNextLoad();
          });

          $scope.$on('user.node.updated',function(node){
              fetchData();
          })
      }
    ])
  ;
}());
