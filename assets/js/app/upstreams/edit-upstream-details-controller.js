/**
 * This file contains all necessary Angular controller definitions for 'frontend.login-history' module.
 *
 * Note that this file should only contain controllers and nothing else.
 */
(function() {
  'use strict';

  angular.module('frontend.upstreams')
    .controller('EditUpstreamDetailsController', [
      '$scope', '$rootScope','$stateParams',
        '$log', '$state','Upstream','MessageService',
      function controller($scope,$rootScope,$stateParams,
                          $log, $state,Upstream, MessageService ) {

          $scope.submit = function() {

              $scope.busy = true
              Upstream.update($scope.upstream.id,angular.copy($scope.upstream))
                  .then(
                      function onSuccess(result) {
                          $log.debug("UpdateUpstreamModalController:created upstream",result)
                          MessageService.success('Upstream updated successfully');
                          $scope.busy = false;
                          $rootScope.$broadcast('kong.upstream.updated',result.data)
                      },function(err){
                          $log.error("UpdateUpstreamModalController:update upstream error",err)
                          $scope.busy = false
                          Upstream.handleError($scope,err)
                      }
                  )
          }
      }
    ])
  ;
}());
