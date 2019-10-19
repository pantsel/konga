/**
 * This file contains all necessary Angular controller definitions for 'frontend.admin.login-history' module.
 *
 * Note that this file should only contain controllers and nothing else.
 */
(function() {
  'use strict';

  angular.module('frontend.dashboard')
    .controller('DashboardController', [
      '$scope', '$rootScope','$log', '$state','$q','InfoService','$localStorage','HttpTimeout', '$location',
        'SettingsService', 'NodeModel','$timeout', 'MessageService','UserModel','UserService','Semver','$http',
      function controller($scope,$rootScope, $log, $state,$q,InfoService,$localStorage,HttpTimeout, $location,
                          SettingsService, NodeModel, $timeout, MessageService, UserModel, UserService, Semver, $http) {


          var loadTime = $rootScope.KONGA_CONFIG.info_polling_interval,
              errorCount = 0,
              hasInitiallyLoaded = false,
              loadPromise;

          $scope.loading = true;
          $scope.hasConnections = false;

          $scope.HttpTimeout = HttpTimeout;

          $scope.showCluster = $rootScope.Gateway ? Semver.cmp($rootScope.Gateway.version,"0.11.0") < 0 : false;

          $scope.closeAlert = function() {
              if($scope.alert) {
                  delete $scope.alert;
              }
          }

          $scope.convert2Unit = function(number) {
              if(number >= 1000000) {
                return Math.trunc(number/1000000) + "M+";
              }else if(number >= 1000){
                return Math.trunc(number/1000) + "K+";
              }else{
                return number.toString();
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
                      $log.info("DashboardController:fetchData:status",$scope.status)
                  })
              var info = InfoService
                  .getInfo()
                  .then(function(resp){
                      $scope.info = resp.data
                      $log.info("DashboardController:fetchData:info",$scope.info)
                  })

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
              type : 'default',
              jwt_algorithm : 'HS256', // Initialize this anyway so that it can be preselected
          }

          $scope.close = function(){
              $uibModalInstance.dismiss();
          }

          $scope.create = function() {

              $scope.busy = true;

              // First of all Create the connection
              NodeModel
                  .create(angular.copy($scope.node))
                  .then(
                      function onSuccess(result) {
                          $log.info('New node created successfully',result)
                          MessageService.success('New node created successfully');

                          var created = result.data[0] || result.data;
                          $rootScope.$broadcast('kong.node.created',created)

                          // Check if the connection is valid
                          $scope.checkingConnection = true;
                          $http.get('kong',{
                              params : {
                                  connection_id : created.id
                              }
                          }).then(function(response){
                              $log.debug("Check connection:success",response)
                              $scope.checkingConnection = false;

                              // Finally, activate the node for the logged in user
                              if(window.no_auth) {
                                  var credentials = $localStorage.credentials;
                                  if(credentials.user.node && credentials.user.node.id == node.id) {
                                      delete credentials.user.node;
                                  }else{
                                      credentials.user.node = created;
                                  }
                                  $rootScope.$broadcast('user.node.updated', credentials.user.node)
                              } else {
                                  UserModel
                                    .update(UserService.user().id, {
                                        node : created
                                    })
                                    .then(
                                      function onSuccess(res) {
                                          var credentials = $localStorage.credentials
                                          credentials.user.node = result.data[0]
                                          $rootScope.$broadcast('user.node.updated',created)
                                      },function(err){
                                          $scope.busy = false
                                          UserModel.handleError($scope,err)
                                          MessageService.error(_.get(err, 'data.message', 'Something went wrong...'))
                                      }
                                    );
                              }

                          }).catch(function(error){
                              $log.debug("Check connection:error",error)
                              $scope.checkingConnection = false;
                              $scope.busy = false;
                              MessageService.error("Oh snap! Can't connect to the created node. Check your connections.")
                          })
                      },function(err){
                        console.log(err);
                        $scope.busy = false
                        NodeModel.handleError($scope,err)
                        MessageService.error(_.get(err, 'data.message', 'Something went wrong...'))
                      }
                  )
              ;




          }



          /**
           * Init UI
           */

          if($rootScope.Gateway || UserService.user().node) {
              fetchData();
          }else{
              NodeModel.count().then(data => {
                  if(data.count)  $scope.hasConnections = true;
                  $scope.loading = false;
              }).catch(err => {
                  $scope.loading = false;
              })
          }


          

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
