/**
 * This file contains all necessary Angular controller definitions for 'frontend.admin.login-history' module.
 *
 * Note that this file should only contain controllers and nothing else.
 */
(function() {
  'use strict';

  angular.module('frontend.dashboard')
    .controller('DashboardController', [
      '$scope', '$log', '$state','_status','_info',
      function controller($scope, $log, $state,_status,_info) {

          $scope.status = _status.data
          $scope.info = _info.data
          $log.debug("status",$scope.status)
          $log.debug("info",$scope.info)

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
                  options : {
                      //title: {
                      //    display: true,
                      //    text: 'database'
                      //},
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
    ])
  ;
}());
