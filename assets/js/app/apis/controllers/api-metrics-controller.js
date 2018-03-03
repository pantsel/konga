/**
 * This file contains all necessary Angular controller definitions for 'frontend.login-history' module.
 *
 * Note that this file should only contain controllers and nothing else.
 */
(function() {
  'use strict';

  angular.module('frontend.apis')
    .controller('ApiMetricsController', [
      '_','$scope', '$log', '$state','$stateParams','ApiService','PluginsService','MessageService','SettingsService','$http',
      function controller(_,$scope, $log, $state, $stateParams, ApiService,PluginsService,MessageService,SettingsService,$http) {


        $scope.loadingPlugins = true;


        google.charts.load('current', {'packages':['corechart']});
        google.charts.setOnLoadCallback(drawChart);

        function drawChart() {
          var query = new google.visualization.Query('http://139.59.145.231:19999/api/v1/data?chart=statsd_timer_kong.github.latency&after=-120&format=datasource&options=nonzero', {sendMethod: 'auto'});

          var chart = new google.visualization.AreaChart(document.getElementById('chart_div'));

          var options = {
            title: 'This is the Jeff Cat API Real Time Latency (ms)',
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


        // Load the plugins assigned to this api
        PluginsService.load({api_id: $stateParams.api_id})
          .then(function (response) {
            console.log("ApiMetricsController: Loaded plugins", response);
            $scope.loadingPlugins = false;
            $scope.statsd = _.find(response.data.data, function (item) {
              return item.name === 'statsd' && item.enabled;
            });
            console.log("$scope.statsd",$scope.statsd);

            if($scope.statsd) {
              var metrics = $scope.statsd.config.metrics;
              if(metrics instanceof Array && metrics.length) {
                // Create visualizations forEach metric
              }
            }
          }).catch(function(err){;
            console.error("ApiMetricsController: Failed to load plugins", err)
            $scope.loadingPlugins = false;
        });



      }
    ])
  ;
}());
