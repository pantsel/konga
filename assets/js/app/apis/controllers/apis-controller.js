(function () {
  'use strict';

  angular.module('frontend.apis')
    .controller('ApisController', [
      '$scope', '$rootScope', '$log', '$state', 'ApiService', 'ListConfig', 'ApiModel',
      'UserService', '$uibModal', 'DialogService', 'ApiHCModel', 'MessageService',
      function controller($scope, $rootScope, $log, $state, ApiService, ListConfig, ApiModel,
                          UserService, $uibModal, DialogService, ApiHCModel, MessageService) {

        ApiModel.setScope($scope, false, 'items', 'itemCount');
        $scope = angular.extend($scope, angular.copy(ListConfig.getConfig('api', ApiModel)));
        $scope.user = UserService.user()
        $scope.toggleStripRequestPathOrUri = toggleStripRequestPathOrUri
        $scope.isRequestPathOrUriStripped = isRequestPathOrUriStripped
        $scope.openAddApiModal = openAddApiModal
        $scope.updateApi = updateApi
        $scope.onDeleteApi = onDeleteApi
        $scope.deleteApiHealthChecks = deleteApiHealthChecks


        /**
         * -----------------------------------------------------------------------------------------------------------
         * Internal Functions
         * -----------------------------------------------------------------------------------------------------------
         */

        function updateApi(id, data) {

          $scope.loading = true

          ApiModel.update(id, data)
            .then(function (res) {
              $log.debug("Update Api: ", res)
              $scope.loading = false
              _fetchData()
            }).catch(function (err) {
            $log.error("Update Api: ", err)
            $scope.loading = false;
          });

        }

        function toggleStripRequestPathOrUri(api) {

          if ($rootScope.Gateway.version.indexOf("0.9.") > -1) {
            api.strip_request_path = !api.strip_request_path;
          } else {
            api.strip_uri = !api.strip_uri;
          }

          $scope.updateApi(api.id, {
            strip_uri: api.strip_uri
          })
        }


        function isRequestPathOrUriStripped(api) {
          if ($rootScope.Gateway && $rootScope.Gateway.version.indexOf("0.9.") > -1) {
            return api.strip_request_path;
          }

          return api.strip_uri
        }


        function openAddApiModal() {
          $uibModal.open({
            animation: true,
            ariaLabelledBy: 'modal-title',
            ariaDescribedBy: 'modal-body',
            templateUrl: 'js/app/apis/views/add-api-modal.html',
            controller: 'AddApiModalController',
            controllerAs: '$ctrl',
            size: 'lg'
          });
        }


        function _fetchData() {
          $scope.loading = true;
          ApiModel.load({
            size: $scope.itemsFetchSize
          }).then(function (response) {
            $scope.items = response;
            $scope.loading = false;
          })

        }


        function loadApiHealthChecks(callback) {
          ApiHCModel.load({
            limit: $scope.items.total
          }).then(function (response) {
            $scope.healthChecks = response
            callback(null, response);
          })
        }


        function assignApiHealthChecks(apis, hcs) {
          apis.forEach(function (api) {

            hcs.forEach(function (hc) {
              if (api.id == hc.api_id) {
                api.health_checks = hc
              }
            })
          })
        }

        function onFilteredItemsChanged(apis) {

          if (!$scope.healthChecks) {
            loadApiHealthChecks(function (err, hcs) {
              if (hcs) {
                assignApiHealthChecks(apis, hcs);
              }
            })
          } else {
            assignApiHealthChecks(apis, $scope.healthChecks);
          }

        }

        function onDeleteApi($index,api) {

          if(api.health_checks && api.health_checks.active) {
            DialogService.alert("Action required","You need to disable the assigned health checks before deleting the api")
            return false;
          }
          $scope.deleteItem($index,api);
        }

        function deleteApiHealthChecks() {
          DialogService.confirm(
            "Confirm", "<strong>You are about to reset the healthchecks of <code>all APIs</code> on <code>all Kong connections</code></strong>." +
            "<br><br>That means that you will have to setup each and every one of the from scratch." +
            "<br><br>Don't worry about affecting the API or Kong Connections entities." +
            "<br>That won't happen." +
            "</br><br>Continue?.",
            ['No don\'t', 'Yes! do it'],
            function accept() {

              ApiService.resetHealthChecks()
                .then(function (success) {
                  MessageService.success('API Healthchecks reset successfully!')

                  $scope.items.data.forEach(function (api) {
                    delete api.health_checks;
                  })

                }).catch(function (err) {
                MessageService.error('Failed to reset API Healthchecks. ' + err.message);
              })

            }, function decline() {
            });
        }

        /**
         * -----------------------------------------------------------------------------------------------------------
         * Watchers and Listeners
         * -----------------------------------------------------------------------------------------------------------
         */

        $scope.$on('api.health_checks', function (event, data) {
          $scope.items.data.forEach(function (api) {
            if (api.health_checks && data.hc_id == api.health_checks.id) {
              api.health_checks.data = data
              $scope.$apply()
            }
          })
        })

        $scope.$on('api.created', function () {
          _fetchData()
        })


        $scope.$on('user.node.updated', function (node) {
          _fetchData()
        })


        // Assign API health checks to filtered items only
        // so that the DOM is not overencumbered
        // when dealing with large datasets

        $scope.$watch('filteredItems', function (newValue, oldValue) {

          if (newValue && (JSON.stringify(newValue) !== JSON.stringify(oldValue))) {
            onFilteredItemsChanged(newValue)
          }
        })


        // Init

        _fetchData();

      }
    ])
  ;
}());
