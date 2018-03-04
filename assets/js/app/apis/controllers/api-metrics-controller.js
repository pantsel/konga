/**
 * This file contains all necessary Angular controller definitions for 'frontend.login-history' module.
 *
 * Note that this file should only contain controllers and nothing else.
 */
(function() {
  'use strict';

  angular.module('frontend.apis')
    .controller('ApiMetricsController', [
      '_','$scope','$rootScope', '$log', '$state','$stateParams','ApiService','$uibModal','InfoService',
      'PluginsService','MessageService','SettingsService','$http','UserService', 'NetdataConnection',
      function controller(_,$scope,$rootScope, $log, $state, $stateParams, ApiService,$uibModal, InfoService,
                          PluginsService,MessageService,SettingsService,$http,UserService,NetdataConnection) {


        $scope.initializing = true;
        $scope.netdataApiUrl = "";
        $scope.chartFamilies = {};


        google.charts.load('current', {'packages':['corechart']});
        google.charts.setOnLoadCallback(drawChart);

        function drawChart() {
          $scope.initializing = true;
          $scope.error = "";
          // Load the plugins assigned to this api


          PluginsService.load({name: 'statsd'})
            .then(function (resp) {
              $scope.loadingPlugins = false;

              var statsdPlugins = resp.data.data;
              if(statsdPlugins.length) {
                var global = _.find(statsdPlugins, function (plugin) {
                  return !plugin.api_id && plugin.enabled;
                });

                var thisApi = _.find(statsdPlugins, function (plugin) {
                  return plugin.api_id === $scope.api.id && plugin.enabled;
                });

                $scope.statsd = thisApi || global;
              }

              if(!$scope.statsd) {
                $scope.initializing = false;
                return false;
              }

              NetdataConnection.load({apiId: $scope.api.id})
                .then(function (results) {
                  $scope.netdataApiUrl = results.length ? results[0].url : UserService.user().node.netdata_url;
                  if($scope.netdataApiUrl) {

                    var chartsListUrl = $scope.netdataApiUrl+ '/api/v1/charts';
                    $http.get(chartsListUrl , {noAuth : true})
                      .then(function success(result){
                        console.log("ApiMetricsController => Retrieved charts list", result);
                        $scope.netDataCharts = result.data;

                        // Filter only the charts of this API
                        $scope.apiCharts = [];
                        for(var key in $scope.netDataCharts.charts) {
                          if($scope.netDataCharts.charts.hasOwnProperty(key) &&
                            key.indexOf($scope.statsd.config.prefix) > -1 &&
                            key.split(".")[1] === $scope.api.name) {
                            if(!$scope.chartFamilies[$scope.netDataCharts.charts[key].family]) {
                              $scope.chartFamilies[$scope.netDataCharts.charts[key].family] = [];
                            }
                            $scope.apiCharts.push($scope.netDataCharts.charts[key]);
                            $scope.chartFamilies[$scope.netDataCharts.charts[key].family].push($scope.netDataCharts.charts[key]);
                          }
                        }

                        $scope.initializing = false;

                      },function error(error){
                        console.error("ApiMetricsController => Failed to retrieved charts list", error);
                        $scope.initializing = false;
                        $scope.error = 'Failed to retrieved charts list from ' + $scope.netdataApiUrl +
                          '. Make sure your configuration is valid';
                      });

                  }else{
                    $scope.initializing = false;
                  }
                }).catch(function (error) {
                $scope.error = error.message;
              });


            }).catch(function(err){
            $scope.initializing = false;
            $scope.error = error.message;
          });
        }

        $scope.initRepeaterItem = function(index, _chart) {
          setTimeout(function() {
            addChart(_chart);
          }, 10);


        };


        function addChart(_chart) {
          var query = new google.visualization.Query($scope.netdataApiUrl +
            _chart.data_url + '&after=-120&format=datasource&options=nonzero');
          var chart = new google.visualization.AreaChart(document.getElementById('chart_' +  _chart.id));
          var options = {
            title:  _chart.title,
            isStacked: 'false',
            vAxis: {minValue: 100},
            selectionMode: 'multiple',
            displayAnnotations: true
          };

          setInterval(function() {
            query.send(function(data) {
              chart.draw(data.getDataTable(), options);
            });
          }, 1000);
        }


        $scope.editActiveNode = function() {
          $uibModal.open({
            animation: true,
            ariaLabelledBy: 'modal-title',
            ariaDescribedBy: 'modal-body',
            templateUrl: 'js/app/connections/create-connection-modal.html',
            controller: 'EditConnectionController',
            resolve: {
              _node: function () {
                return UserService.user().node;
              }
            }
          });
        };


        $scope.editNetdataUrl = function () {
          $uibModal.open({
            animation: true,
            ariaLabelledBy: 'modal-title',
            ariaDescribedBy: 'modal-body',
            templateUrl: 'js/app/apis/views/edit-netdata-connection.html',
            controller: function ($scope,UserService,$uibModalInstance,NetdataConnection,_currentNetdataUrl, _api) {

              $scope.api = _api;
              $scope.netdataConnection = {
                url :'',
                apiId: _api.id
              }
              $scope.close = function(){
                $uibModalInstance.dismiss();
              };
              $scope.closeErrorAlert = function() {
                $scope.error = "";
              }

              $scope.submit = function () {
                $scope.error = "";
                if(!$scope.netdataConnection.url || !validateUrl($scope.netdataConnection.url)) {
                  $scope.error = "Invalid URL";
                  return false;
                }

                if($scope.netdataConnection.id) {
                  NetdataConnection.update($scope.netdataConnection.id, _.omit($scope.netdataConnection, ['id']))
                    .then(function (result) {
                      console.log("Netdata Connection updated", result);
                      $rootScope.$broadcast('api.' + _api.id + '.netdataConnection.updated',result.data);
                      $uibModalInstance.dismiss();
                    }).catch(function (error) {
                    console.error("Failed to update netdata connection", error);
                    $scope.error = error.message;
                  });
                }else {
                  NetdataConnection.create($scope.netdataConnection)
                    .then(function (result) {
                      console.log("Netdata Connection created", result);
                      $rootScope.$broadcast('api.' + _api.id + '.netdataConnection.updated',result.data);
                      $uibModalInstance.dismiss();
                    }).catch(function (error) {
                    console.error("Failed to create netdata connection", error);
                    $scope.error = error.message;
                  });
                }


              }

              function validateUrl(value) {
                return /^(?:(?:(?:https?|ftp):)?\/\/)(?:\S+(?::\S*)?@)?(?:(?!(?:10|127)(?:\.\d{1,3}){3})(?!(?:169\.254|192\.168)(?:\.\d{1,3}){2})(?!172\.(?:1[6-9]|2\d|3[0-1])(?:\.\d{1,3}){2})(?:[1-9]\d?|1\d\d|2[01]\d|22[0-3])(?:\.(?:1?\d{1,2}|2[0-4]\d|25[0-5])){2}(?:\.(?:[1-9]\d?|1\d\d|2[0-4]\d|25[0-4]))|(?:(?:[a-z\u00a1-\uffff0-9]-*)*[a-z\u00a1-\uffff0-9]+)(?:\.(?:[a-z\u00a1-\uffff0-9]-*)*[a-z\u00a1-\uffff0-9]+)*(?:\.(?:[a-z\u00a1-\uffff]{2,})))(?::\d{2,5})?(?:[/?#]\S*)?$/i.test(value);
              }

              function init() {
                $scope.error = "";
                NetdataConnection.load({apiId: _api.id})
                  .then(function (results) {
                    // console.log("Get current netdata connection", results);
                    if(!results.length && _currentNetdataUrl) {
                      $scope.message = "The active Kong node's netdata server is currently used." +
                        " Set a URL here only if you want to use a different netdata server for this API.";
                    }

                    if(results.length) {
                      $scope.netdataConnection = results[0];
                    }
                  }).catch(function (error) {
                  $scope.error = error.message;
                });
              }

              init();


            },
            resolve: {
              _currentNetdataUrl: function () {
                return $scope.netdataApiUrl;
              },
              _api: function () {
                return $scope.api;
              }
            }
          });
        }



        $scope.$on('kong.node.updated', function (ev, node) {
          if(UserService.user().node && UserService.user().node.id === node.id) {
            $scope.netdataApiUrl = UserService.user().node.netdata_url;
            drawChart();
          }
        });

        $scope.$on('api.' + $scope.api.id + '.netdataConnection.updated', function (ev, connection) {
          if($scope.netdataApiUrl !== connection.url) {
            $scope.netdataApiUrl = connection.url;
            drawChart();
          }
        });

        $scope.$on('api.' + $scope.api.id + '.netdataConnection.deleted', function (ev, connection) {
          $scope.netdataApiUrl = UserService.user().node.netdata_url;
          drawChart();
        });

      }
    ])
  ;
}());
