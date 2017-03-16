/**
 * This file contains all necessary Angular controller definitions for 'frontend.login-history' module.
 *
 * Note that this file should only contain controllers and nothing else.
 */
(function() {
  'use strict';

  angular.module('frontend.upstreams')
    .controller('AddUpstreamModalController', [
      '$scope', '$rootScope','$log', '$state','ApiService','SettingsService',
        '$uibModalInstance','Upstream','MessageService',
      function controller($scope,$rootScope, $log, $state, ApiService, SettingsService,
                          $uibModalInstance, Upstream, MessageService ) {

          $scope.upstream = {
              slots : 1000
          }


          $scope.close = function() {
              $uibModalInstance.dismiss()
          }

          $scope.submit = function() {

              $scope.busy = true
              Upstream.create(angular.copy($scope.upstream))
                  .then(
                      function onSuccess(result) {
                          $log.debug("AddUpstreamModalController:created upstream",result)
                          MessageService.success('New upstream created successfully');
                          $scope.busy = false;
                          $rootScope.$broadcast('kong.upstream.created',result.data)
                          $uibModalInstance.dismiss()
                      },function(err){
                          $log.error("AddUpstreamModalController:created upstream error",err)
                          $scope.busy = false
                          Upstream.handleError($scope,err)
                      }
                  )
          }
      }
    ])
  ;
}());
