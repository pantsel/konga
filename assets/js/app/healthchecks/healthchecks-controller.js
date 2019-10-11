/**
 * This file contains all necessary Angular controller definitions for 'frontend.admin.login-history' module.
 *
 * Note that this file should only contain controllers and nothing else.
 */
(function () {
  'use strict';

  angular.module('frontend.healthchecks')
    .controller('HealthChecksController', [
      '$scope', '$rootScope', '$log', '$state', 'ApiService', '$uibModal', 'DialogService', 'UserService', '$q', '$ngBootbox',
      'MessageService', 'SocketHelperService', '$http', 'Semver', '$timeout', 'ApiHealthCheck', 'ListConfig',
      function controller($scope, $rootScope, $log, $state, ApiService, $uibModal, DialogService, UserService, $q, $ngBootbox,
                          MessageService, SocketHelperService, $http, Semver, $timeout, ApiHealthCheck, ListConfig) {

        ApiHealthCheck.setScope($scope, false, 'items', 'itemCount');

        // Add default list configuration variable to current scope
        $scope = angular.extend($scope, angular.copy(ListConfig.getConfig()));

        $scope.user = UserService.user();


        // Initialize used title items
        $scope.titleItems = ListConfig.getTitleItems('hc');


        // Initialize default sort data

        $scope.paging = {
          currentPage: 1,
        };

        $scope.sort = {
          column: 'createdAt',
          direction: false,
        };

        // Initialize filters
        $scope.filters = {
          searchWord: '',
          columns: $scope.titleItems,
        };

        // Function to change sort column / direction on list
        $scope.changeSort = function changeSort(item) {
          var sort = $scope.sort;

          if (sort.column === item.column) {
            sort.direction = !sort.direction;
          } else {
            sort.column = item.column;
            sort.direction = true;
          }

          _triggerFetchData();
        };


        $scope.pageChanged = function () {
          $log.log('Page changed to: ' + $scope.paging.currentPage);
          _fetchData();
        }

        /**
         * Simple watcher for 'itemsPerPage' scope variable. If this is changed we need to fetch author data
         * from server.
         */
        $scope.$watch('itemsPerPage', function watcher(valueNew, valueOld) {
          if (valueNew !== valueOld) {
            _triggerFetchData();
          }
        });


        $scope.$watch('filters', function watcher(valueNew, valueOld) {
          if (valueNew !== valueOld) {
            _triggerFetchData();
          }
        }, true);


        function _triggerFetchData() {
          if ($scope.paging.currentPage === 1) {
            _fetchData();
          } else {
            $scope.paging.currentPage = 1;
          }
        }


        /**
         * Helper function to fetch actual data for GUI from backend server with current parameters:
         *  1) Current page
         *  2) Search word
         *  3) Sort order
         *  4) Items per page
         *
         * Actually this function is doing two request to backend:
         *  1) Data count by given filter parameters
         *  2) Actual data fetch for current page with filter parameters
         *
         * These are fetched via 'AuthorModel' service with promises.
         *
         * @private
         */
        function _fetchData() {
          $scope.loading = true;

          // Common parameters for count and data query
          var commonParameters = {
            where: SocketHelperService.getWhere($scope.filters)
          };

          // Data query specified parameters
          var parameters = {
            limit: $scope.itemsPerPage,
            skip: ($scope.paging.currentPage - 1) * $scope.itemsPerPage,
            sort: $scope.sort.column + ' ' + ($scope.sort.direction ? 'ASC' : 'DESC')
          };

          // Fetch data count
          var count = ApiHealthCheck
            .count()
            .then(
              function onSuccess(response) {
                console.log(response)
                $scope.itemCount = response.count;
              }
            );


          // Fetch actual data
          var load = ApiHealthCheck
            .load(_.merge({}, commonParameters, parameters))
            .then(
              function onSuccess(response) {
                console.log(response)
                $scope.items = response;

                // Check if the all apis still exist
                $scope.items.forEach(function (item) {
                  ApiService.findById(item.api_id).then(function (result) {
                  }).catch(function (error) {
                    if (error.status === 404) {
                      item.isOrphaned = true;
                    }
                  });
                });

              }
            );

          // And wrap those all to promise loading
          $q
            .all([count, load])
            .finally(
              function onFinally() {
                $scope.loaded = true;
                $scope.loading = false;

              }
            )
          ;
        }


        $scope.toggleItem = function (item) {
          item.active = !item.active;
          updateItem(item);
        }

        function updateItem(item) {

          if (!$scope.user.hasPermission('healthchecks', 'update')) {

            MessageService.error("You don't have permissions to perform this action")
            return false;
          }

          ApiHealthCheck.update(item.id, {
            active: item.active
          })
            .then(function (res) {


            }).catch(function (err) {
            $log.error("updateHC", err);
          });
        }

        $scope.deleteItem = function deleteItem(item) {


          DialogService.confirm(
            "Confirm", "Really want to delete the selected item?",
            ['No don\'t', 'Yes! delete it'],
            function accept() {
              ApiHealthCheck
                .delete(item.id)
                .then(
                  function onSuccess(data) {
                    if (data.status < 204) {
                      MessageService.success('HealthCheck deleted successfully');
                      $rootScope.$broadcast('api.healthcheck.deleted', item);
                      _triggerFetchData();
                    }
                  }
                ).catch(function (error) {
                console.error("Failed to delete item", error);
              })
              ;
            }, function decline() {
            });


        };

        _triggerFetchData();

      }
    ])
  ;
}());
