/**
 * This file contains all necessary Angular controller definitions for 'frontend.login-history' module.
 *
 * Note that this file should only contain controllers and nothing else.
 */
(function () {
  'use strict';

  angular.module('frontend.upstreams')
    .controller('EditUpstreamTargetsController', [
      '_','$scope', '$rootScope', '$stateParams',
      '$log', '$state', 'Upstream', 'MessageService', '$uibModal', 'DataModel', 'ListConfig', '$http', 'DialogService',
      function controller(_,$scope, $rootScope, $stateParams,
                          $log, $state, Upstream, MessageService, $uibModal, DataModel, ListConfig, $http, DialogService) {

        var targetsEndpoint = $rootScope.compareKongVersion('0.12.0') >= 0 ? '/targets' : '/targets/active';
        var Target = new DataModel('kong/upstreams/' + $stateParams.id + targetsEndpoint, true)
        Target.setScope($scope, false, 'items', 'itemCount');


        // Add default list configuration variable to current scope
        $scope = angular.extend($scope, angular.copy(ListConfig.getConfig('target', Target)));

        // Set initial data
        $scope.loading = false
        $scope.items = []
        $scope.totalItems = 0


        // Initialize used title items
        $scope.titleItems = ListConfig.getTitleItems('target');


        $scope.sort = {
          column: 'created_at',
          direction: true
        };

        // Initialize filters
        $scope.filters = {
          searchWord: '',
          columns: $scope.titleItems
        };

        $scope.changeSort = function changeSort(item) {
          var sort = $scope.sort;

          if (sort.column === item.column) {
            sort.direction = !sort.direction;
          } else {
            sort.column = item.column;
            sort.direction = true;
          }
        };

        $scope.globalCheck = {
          isAllChecked: false
        };

        $scope.$watch('globalCheck.isAllChecked', function watcher(valueNew, valueOld) {
          if (valueNew !== valueOld) {
            checkItems(valueNew)
          }
        });

        function checkItems(checked) {
          $scope.items.forEach(function (item) {
            item.checked = checked
          });
        }

        $scope.onAddTarget = function () {
          var modalInstance = $uibModal.open({
            animation: true,
            ariaLabelledBy: 'modal-title',
            ariaDescribedBy: 'modal-body',
            templateUrl: 'js/app/upstreams/targets/add-target-modal.html',
            controller: [
              '$scope', '$rootScope', '$log', '$uibModalInstance', 'DataModel', 'MessageService', '_upstream',
              function ($scope, $rootScope, $log, $uibModalInstance, DataModel, MessageService, _upstream) {

                var targetModel = new DataModel('kong/upstreams/' + _upstream.id + '/targets', true)

                $scope.upstream = _upstream

                $scope.item = {
                  target: '',
                  weight: 100
                }

                $scope.close = function () {
                  $uibModalInstance.dismiss()
                }

                $scope.submit = function () {
                  targetModel.create($scope.item)
                    .then(function (resp) {
                      $log.debug("Create target =>", resp)
                      MessageService.success("Target added successfully!")
                      $uibModalInstance.dismiss({
                        data: resp
                      })
                    }, function (err) {
                      $log.error("Create target error =>", err)
                      $scope.errors = {}
                      if (err.data && err.data.body) {
                        for (var key in err.data.body) {
                          $scope.errors[key] = err.data.body[key]
                        }
                      }
                    })
                }
              }
            ],
            controllerAs: '$ctrl',
            resolve: {
              _upstream: function () {
                return $scope.upstream
              }
            }
            //size: 'lg',
          });

          modalInstance.result.then(function () {

          }, function (data) {
            if (data && data.data) _fetchData()
          });
        }

        // Overwrite deleteItem method
        $scope.deleteItem = function (index, item) {
          DialogService.prompt(
            "Confirm", "Really want to delete the selected item?",
            ['No don\'t', 'Yes! delete it'],
            function accept() {

              $http.delete('kong/upstreams/' + $stateParams.id + '/targets/' + item.id)
                .then(function (deleted) {
                  _fetchData()
                }).catch(function (err) {

              })
            }, function decline() {
            })
        }

        function _fetchData() {
          var config = ListConfig.getConfig();

          var parameters = {
            size: config.itemsFetchSize
          };

          Target.load(_.merge({}, parameters)).then(function (response) {
            $scope.items = JSON.stringify(response.data) === "{}" ? [] : response.data;

            if($rootScope.compareKongVersion('0.12.2') >= 0) {
              // Fetch targets Health
              Upstream.health($stateParams.id).then(function (response) {
                if(response && response.data.length) {
                  $scope.items.forEach(function(item){
                    var healthObj = _.find(response.data, function (target) {
                      return target.id === item.id;
                    });
                    item.health = healthObj && healthObj.health ? healthObj.health : "";
                  });
                }
              });

            }
          });
        }


        _fetchData()

      }
    ])
  ;
}());
