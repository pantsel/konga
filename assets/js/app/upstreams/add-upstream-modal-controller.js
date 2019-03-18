/**
 * This file contains all necessary Angular controller definitions for 'frontend.login-history' module.
 *
 * Note that this file should only contain controllers and nothing else.
 */
(function () {
  'use strict';

  angular.module('frontend.upstreams')
    .controller('AddUpstreamModalController', [
      '$scope', '$rootScope', '$log', '$state', 'ApiService', 'SettingsService',
      '$uibModalInstance', 'Upstream', 'MessageService',
      function controller($scope, $rootScope, $log, $state, ApiService, SettingsService,
                          $uibModalInstance, Upstream, MessageService) {

        $scope.upstream = {
          slots: 1000
        }

        if($rootScope.compareKongVersion('0.12.0') >= 0) {
         $scope.upstream['hash_on'] = 'none';
         $scope.upstream['hash_fallback'] = 'none';
        }

        $scope.onTagInputKeyPress = function ($event) {
          if($event.keyCode === 13) {
            if(!$scope.upstream.tags) $scope.upstream.tags = [];
            $scope.upstream.tags = $scope.upstream.tags.concat($event.currentTarget.value);
            $event.currentTarget.value = null;
          }
        }


        $scope.close = function () {
          $uibModalInstance.dismiss()
        }

        $scope.submit = function () {

          $scope.busy = true
          var data = angular.copy($scope.upstream)

          // Fix non numeric arrays
          var arr = ["active.healthy", "active.unhealthy", "passive.healthy", "passive.unhealthy"];
          arr.forEach(function (item) {
            if (_.get(data, 'healthchecks.' + item + '.http_statuses')) {
              _.update(data, 'healthchecks.' + item + '.http_statuses', function (statuses) {
                return _.map(statuses, function (status) {
                  try{
                    return parseInt(status);
                  }catch (e) {
                    return status;
                  }
                })
              })
            }
          });

          delete data.token
          $log.debug("data", data)
          Upstream.create(data)
            .then(
              function onSuccess(result) {
                $log.debug("AddUpstreamModalController:created upstream", result)
                MessageService.success('New upstream created successfully');
                $scope.busy = false;
                $rootScope.$broadcast('kong.upstream.created', result.data)
                $uibModalInstance.dismiss()
              }, function (err) {
                $log.error("AddUpstreamModalController:created upstream error", err)
                $scope.busy = false
                Upstream.handleError($scope, err)
              }
            )
        }
      }
    ])
  ;
}());
