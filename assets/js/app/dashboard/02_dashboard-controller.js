/**
 * This file contains all necessary Angular controller definitions for 'frontend.admin.login-history' module.
 *
 * Note that this file should only contain controllers and nothing else.
 */
(function() {
  'use strict';

  angular.module('frontend.dashboard')
    .controller('DashboardController', [
      '$scope', '$rootScope','$log', '$state','$q','InfoService','$localStorage','HttpTimeout',
        'SettingsService', 'NodeModel','$timeout', 'MessageService','UserModel','UserService','Semver',
      function controller($scope,$rootScope, $log, $state,$q,InfoService,$localStorage,HttpTimeout,
                          SettingsService, NodeModel, $timeout, MessageService, UserModel, UserService, Semver) {


          var loadTime = $rootScope.KONGA_CONFIG.info_polling_interval,
              errorCount = 0,
              hasInitiallyLoaded = false,
              loadPromise;

          $scope.HttpTimeout = HttpTimeout;

          $scope.showCluster = $rootScope.Gateway ? Semver.cmp($rootScope.Gateway.version,"0.11.0") < 0 : false;

          $scope.isKongVersionGreater = function (version) {
              return $rootScope.Gateway ? Semver.cmp($rootScope.Gateway.version,version) >= 0 : false;
          }

          $scope.closeAlert = function() {
              if($scope.alert) {
                  delete $scope.alert;
              }
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
                          'Handled',
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
                              }],
                              yAxes: [{
                                  ticks: {
                                      min: 0
                                  }
                              }]
                          }
                      },
                      series : ['Connections'],
                      data : [
                          $scope.status.server.connections_accepted,
                          $scope.status.server.connections_handled,
                          $scope.status.server.total_requests
                      ]
                  },
                  activity : {
                      labels : [
                          'Active',
                          'Reading',
                          'Waiting',
                          'Writing',
                      ],
                      options: {
                          scales: {
                              xAxes: [{
                                  ticks: {
                                      autoSkip: false,
                                      maxRotation: 0,
                                      minRotation: 0
                                  }
                              }],
                              yAxes: [{
                                  ticks: {
                                      min: 0
                                  }
                              }]
                          }
                      },
                      series : ['Connections'],
                      data : [
                          $scope.status.server.connections_active,
                          $scope.status.server.connections_reading,
                          $scope.status.server.connections_waiting,
                          $scope.status.server.connections_writing
                      ]


                  },
                  timers : {
                      labels : [
                          'Pending',
                          'Running'
                      ],
                      options : {
                          yAxes: [{
                            ticks: {
                              min: 0
                          }
                        }]
                      },
                      series : ['Timers'],
                      data : [
                          $scope.info.timers.pending,
                          $scope.info.timers.running
                      ]
                  },
                  database : {
                      labels : Object.keys($scope.status.database),
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
                      data : Object.keys($scope.status.database).map(function (key) {
                          return $scope.status.database[key]
                      })
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
              // var cluster = InfoService
              //     .clusterStatus()
              //     .then(function(resp){
              //         $scope.cluster = resp.data
              //         $log.debug("DashboardController:fetchData:cluster",$scope.cluster)
              //     })

              $q
                  .all([status, info])
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



          $scope.kong_versions = SettingsService.getKongVersions()

          $scope.node = {
              kong_admin_url : '',
              // kong_version : '0-10-x',
          }

          $scope.close = function(){
              $uibModalInstance.dismiss()
          }

          $scope.create = function() {


              // Check if the connection is valid
              $scope.checkingConnection = true;
              InfoService.nodeStatus({
                  kong_admin_url : $scope.node.kong_admin_url
              }).then(function(response){
                  $log.debug("Check connection:success",response)
                  $scope.checkingConnection = false;

                  // If check succeeds create the connection
                  NodeModel
                      .create(angular.copy($scope.node))
                      .then(
                          function onSuccess(result) {
                              $log.info('New node created successfully',result)
                              MessageService.success('New node created successfully');
                              $scope.busy = false;
                              $rootScope.$broadcast('kong.node.created',result.data)

                              // Finally, activate the node for the logged in user
                              UserModel
                                  .update(UserService.user().id, {
                                      node : result.data
                                  })
                                  .then(
                                      function onSuccess(res) {
                                          var credentials = $localStorage.credentials
                                          credentials.user.node = result.data
                                          $rootScope.$broadcast('user.node.updated',result.data)
                                      },function(err){
                                          $scope.busy = false
                                          UserModel.handleError($scope,err)
                                      }
                                  );




                          },function(err){
                              $scope.busy = false
                              NodeModel.handleError($scope,err)
                          }
                      )
                  ;



              }).catch(function(error){
                  $log.debug("Check connection:error",error)
                  $scope.checkingConnection = false;
                  MessageService.error("Oh snap! Can't connect to the selected node.")
              })


          }



          /**
           * Init UI
           */

          if($rootScope.Gateway || UserService.user().node) fetchData();


          

          var cancelNextLoad = function() {
              $timeout.cancel(loadPromise);
          };

          var nextLoad = function(mill) {


              if(!$rootScope.Gateway) return false;

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
