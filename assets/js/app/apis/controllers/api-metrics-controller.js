/**
 * This file contains all necessary Angular controller definitions for 'frontend.login-history' module.
 *
 * Note that this file should only contain controllers and nothing else.
 */
(function() {
  'use strict';

  angular.module('frontend.apis')
    .controller('ApiMetricsController', [
      '_','$scope','$rootScope', '$log', '$state','$stateParams','ApiService',
      'PluginsService','MessageService','SettingsService','$http','UserService',
      function controller(_,$scope,$rootScope, $log, $state, $stateParams, ApiService,
                          PluginsService,MessageService,SettingsService,$http,UserService) {


        $scope.initializing = true;

        // $scope.netdataApiUrl = 'http://139.59.145.231:19999';
        $scope.netdataApiUrl = UserService.user().node.netdata_url;
        $scope.chartFamilies = {};

        google.charts.load('current', {'packages':['corechart']});
        google.charts.setOnLoadCallback(drawChart);


        function drawChart() {

          $scope.error = "";
          // Load the plugins assigned to this api
          PluginsService.load({api_id: $stateParams.api_id})
            .then(function (response) {
              console.log("ApiMetricsController: Loaded plugins", response);
              $scope.loadingPlugins = false;
              $scope.statsd = _.find(response.data.data, function (item) {
                return item.name === 'statsd' && item.enabled;
              });
              console.log("$scope.statsd",$scope.statsd);



              if($scope.statsd && $scope.netdataApiUrl) {

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
                    $scope.error = error.message;
                  });

              }else{
                $scope.initializing = false;
              }
            }).catch(function(err){;
            console.error("ApiMetricsController: Failed to load plugins", err)
            $scope.initializing = false;
            $scope.error = error.message;
          });
        }


        $scope.initRepeaterItem = function(index, _chart) {
          console.log('new repeater item at index '+ index +':', _chart);
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




      }
    ])
  ;
}());
