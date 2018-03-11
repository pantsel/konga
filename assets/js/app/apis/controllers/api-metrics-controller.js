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

        google.charts.load('current', {'packages':['corechart']});
        google.charts.setOnLoadCallback(initDrawingCharts);

        $scope.netdataApiUrl = "";
        $scope.intervals = {};
        $scope.initializing = true;

        $scope.initRepeaterItem = function(index, _chart) {
          setTimeout(function() {
            addChart(_chart);
          }, 10);


        };

        $scope.getHostGroups = function () {
          var groupArray = [];
          angular.forEach($scope.apiCharts, function (item, idx) {
            if (groupArray.indexOf(item.hostname) === -1) {
              groupArray.push(item.hostname);
            }
          });

          return groupArray.sort();
        };

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
        };




        function initDrawingCharts() {
          $scope.initializing = true;
          $scope.error = "";

          getAssignedStatsDPlugin(function (err, statsD) {
            if(err) {
              $scope.initializing = false;
              $scope.error = err.message;
              return;
            }

            $scope.statsd = statsD;

            getApiNetdataConnection(function (err, netdataApiUrl) {
              if(err) {
                $scope.error = err.message;
                return;
              }

              $scope.netdataApiUrl = netdataApiUrl;

              if($scope.netdataApiUrl && $scope.statsd) {
                getAllNetdataHosts();
              }else{
                $scope.initializing = false;
              }

            });
          });
        }

        function getAssignedStatsDPlugin(cb) {

          // Firstly, we retrieve all added statss plugins
          PluginsService.load({name: 'statsd'})
            .then(function (resp) {
              $scope.loadingPlugins = false;

              var statsdPlugins = resp.data.data;
              if(statsdPlugins.length) {

                // Find the statsD plugin that was added globally to all APIs (if there is one)
                var global = _.find(statsdPlugins, function (plugin) {
                  return !plugin.api_id && plugin.enabled;
                });

                // Find the statsD plugin that was specifically assigned to this API (if there is one)
                var thisApi = _.find(statsdPlugins, function (plugin) {
                  return plugin.api_id === $scope.api.id && plugin.enabled;
                });

                // In case a statsD plugin is assigned both globally and to this API,
                // we will prefer to use the later.
                // Specific API assignment, overcomes the global one.
                return cb(null,thisApi || global);
              }

            }).catch(function(err){
            return cb(err);
          });
        }

        function getApiNetdataConnection(cb) {
          NetdataConnection.load({apiId: $scope.api.id})
            .then(function (results) {

              // If no netdata connection is created for this API
              // fallback to current Kong connection's netdata_url (if set in connections page)
              var url = results.length ? results[0].url : UserService.user().node.netdata_url;

              return cb(null, url);
            }).catch(function (error) {

            return cb(error);
          });
        }

        function getAllNetdataHosts() {
          var chartsListUrl = $scope.netdataApiUrl+ '/api/v1/charts';
          $http.get(chartsListUrl , {noAuth : true})
            .then(function success(result){
              $scope.hosts = result.data.hosts;
              $scope.initializing = false;
              $scope.activeHost = result.data.hosts[0];
              $scope.loadingHostCharts = true;
              getHostCharts($scope.activeHost);
            },function error(error){
              console.error("ApiMetricsController => Failed to retrieved charts list", error);
              $scope.initializing = false;
              $scope.error = 'Failed to retrieved charts list from ' + $scope.netdataApiUrl +
                '. Make sure your configuration is valid';
            });
        }

        function getHostCharts(host) {
          $scope.chartFamilies = {}; // Re-init chart families
          clearIntervals();

          $http.get($scope.netdataApiUrl+ '/host/' + host.hostname + '/api/v1/charts' , {noAuth : true})
            .then(function success(result){

              host.charts = result.data.charts;

              for(var key in host.charts) {
                if(host.charts[key].id.indexOf($scope.statsd.config.prefix) < 0 ||
                  host.charts[key].id.indexOf($scope.api.name) < 0) {
                  delete host.charts[key];
                }else{
                  if(!$scope.chartFamilies[host.charts[key].family]) {
                    $scope.chartFamilies[host.charts[key].family] = [];
                  }

                  $scope.chartFamilies[host.charts[key].family].push(host.charts[key]);
                }
              }

              $scope.loadingHostCharts = false;

              if(Object.keys(host.charts).length === 0) {
                $scope.error = "No metrics found for this API on host `" + $scope.activeHost.hostname + "`";
              }

            }).catch(function (error) {
            $scope.initializing = false;
            $scope.loadingHostCharts = false;
            $scope.error = error.message;
          });
        }

        function addChart(_chart) {
          var elem;
          var query = new google.visualization.Query($scope.netdataApiUrl +
            _chart.data_url + '&after=-120&format=datasource&options=nonzero');

          switch (_chart.type) {
            case "line":
              elem = new google.visualization.LineChart(document.getElementById('chart_' +  _chart.id));
              break;
            default:
              elem = new google.visualization.AreaChart(document.getElementById('chart_' +  _chart.id));
          }


          // Listen to `onmouseover`,`onmouseout` events
          google.visualization.events.addListener(elem, 'onmouseover', function (row, column) {
            if($scope.intervals[_chart.id]) {
              clearInterval($scope.intervals[_chart.id]);
            }
          });

          google.visualization.events.addListener(elem, 'onmouseout', function (row, column) {
            setChartQueryInterval(query,elem,_chart);
          });


          setChartQueryInterval(query,elem,_chart);

        }

        function setChartQueryInterval(query,elem,c) {
          var options = {
            title:  c.id,
            selectionMode: 'multiple',
            lineWidth: 1,
            fontSize: 11,
            hAxis: {
              viewWindowMode: 'maximized',
              slantedText: false,
              format:'HH:mm:ss',
              textStyle: {
                fontSize: 9
              },
              gridlines: {
                color: '#EEE'
              }
            },
            vAxis: {
              viewWindowMode: 'maximized',
              minValue: 100,
              direction: 1,
              textStyle: {
                fontSize: 9
              },
              gridlines: {
                color: '#EEE'
              }
            },
            focusTarget: 'category',
            annotation: {
              '1': {
                style: 'line'
              }
            },
            pointsVisible: 0,
            titlePosition: 'out',
            titleTextStyle: {
              fontSize: 11
            },
            tooltip: {
              isHtml: false,
              ignoreBounds: true,
              textStyle: {
                fontSize: 9
              }
            },
            curveType: 'function',
            areaOpacity: 0.3,
            isStacked: false

          };
          $scope.intervals[c.id] = setInterval(function() {
            query.send(function(data) {
              elem.draw(data.getDataTable(), options);
            });
          }, 1000);
        }

        function clearIntervals() {
          for(var key in $scope.intervals) {
            if($scope.intervals.hasOwnProperty(key)) {
              clearInterval($scope.intervals[key]);
            }
          }
        }


        /**
         * -----------------------------------------------------------
         * ADD LISTENERS
         * -----------------------------------------------------------
         */
        $scope.$on('kong.node.updated', function (ev, node) {
          if(UserService.user().node && UserService.user().node.id === node.id) {
            $scope.netdataApiUrl = UserService.user().node.netdata_url;
            initDrawingCharts();
          }
        });

        $scope.$on('api.' + $scope.api.id + '.netdataConnection.updated', function (ev, connection) {
          if($scope.netdataApiUrl !== connection.url) {
            $scope.netdataApiUrl = connection.url;
            initDrawingCharts();
          }
        });

        $scope.$on('api.' + $scope.api.id + '.netdataConnection.deleted', function (ev, connection) {
          $scope.netdataApiUrl = UserService.user().node.netdata_url;
          initDrawingCharts();
        });

        $scope.$on('$destroy', function() {
          clearIntervals();
        });

      }
    ])
  ;
}());
