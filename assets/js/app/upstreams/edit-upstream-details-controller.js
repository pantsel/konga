/**
 * This file contains all necessary Angular controller definitions for 'frontend.login-history' module.
 *
 * Note that this file should only contain controllers and nothing else.
 */
(function () {
  'use strict';

  angular.module('frontend.upstreams')
    .controller('EditUpstreamDetailsController', [
      '_', '$scope', '$rootScope', '$stateParams',
      '$log', '$state', 'Upstream', 'MessageService',
      function controller(_, $scope, $rootScope, $stateParams,
                          $log, $state, Upstream, MessageService) {


        $scope.context = 'update';
        $scope.submit = function () {

          $scope.busy = true
          var data = angular.copy($scope.upstream);
          fixHealthChecksHttpStatusesType(data);
          delete data.data; // Kong 1.x related bug
          Upstream.update($scope.upstream.id, data)
            .then(
              function onSuccess(result) {
                $log.debug("UpdateUpstreamModalController:created upstream", result)
                MessageService.success('Upstream updated successfully');
                $scope.busy = false;
                $rootScope.$broadcast('kong.upstream.updated', result.data)
              }, function (err) {
                $log.error("UpdateUpstreamModalController:update upstream error", err)
                $scope.busy = false
                Upstream.handleError($scope, err)
              }
            )
        }


        function fixHealthChecksHttpStatusesType(upstream) {
          // Fix non numeric arrays
          var arr = ["active.healthy", "active.unhealthy", "passive.healthy", "passive.unhealthy"];
          arr.forEach(function (item) {
            if (_.get(upstream, 'healthchecks.' + item + '.http_statuses')) {
              _.update(upstream, 'healthchecks.' + item + '.http_statuses', function (statuses) {
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
        }
      }
    ])
  ;
}());
