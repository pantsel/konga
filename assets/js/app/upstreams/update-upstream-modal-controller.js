/**
 * This file contains all necessary Angular controller definitions for 'frontend.login-history' module.
 *
 * Note that this file should only contain controllers and nothing else.
 */
(function() {
  'use strict';

  angular.module('frontend.upstreams')
    .controller('UpdateUpstreamModalController', [
      '$scope', '$rootScope','$log', '$state','ApiService','SettingsService',
        '$uibModalInstance','Upstream','MessageService','_item',
      function controller($scope,$rootScope, $log, $state, ApiService, SettingsService,
                          $uibModalInstance, Upstream, MessageService,_item ) {

          $scope.upstream = _item


          $scope.close = function() {
              $uibModalInstance.dismiss()
          }

          $scope.submit = function() {

              $scope.busy = true
              Upstream.update($scope.upstream.id,angular.copy($scope.upstream))
                  .then(
                      function onSuccess(result) {
                          $log.debug("UpdateUpstreamModalController:created upstream",result)
                          MessageService.success('Upstream updated successfully');
                          $scope.busy = false;
                          $rootScope.$broadcast('kong.upstream.updated',result.data)
                          $uibModalInstance.dismiss()
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
