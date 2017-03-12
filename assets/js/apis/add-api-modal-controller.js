/**
 * This file contains all necessary Angular controller definitions for 'frontend.login-history' module.
 *
 * Note that this file should only contain controllers and nothing else.
 */
(function() {
  'use strict';

  angular.module('frontend.apis')
    .controller('AddApiModalController', [
      '$scope', '$rootScope','$log', '$state','ApiService','SettingsService',
        '$uibModalInstance','MessageService',
      function controller($scope,$rootScope, $log, $state, ApiService, SettingsService,
                          $uibModalInstance, MessageService ) {

          var apis = {
              '0-9-x': {
                  name: '',
                  request_host: '',
                  request_path: '',
                  strip_request_path: false,
                  preserve_host: false,
                  upstream_url: ''
              },
              '0-10-x' : {
                  name : '',
                  hosts : '',
                  uris : '',
                  methods : '',
                  strip_uri : true,
                  preserve_host: false,
                  retries : 5,
                  upstream_connect_timeout : 6000,
                  upstream_send_timeout : 6000,
                  upstream_read_timeout : 6000,
                  https_only:false,
                  http_if_terminated:true,
                  upstream_url : ''
              }
          }

          $scope.settings = SettingsService.getSettings()

          $scope.api = apis[$scope.settings.kong_version]

          $scope.close = function() {
              $uibModalInstance.dismiss()
          }



          $scope.submit = function() {

              clearApi()

              ApiService.add($scope.api)
                  .then(function(res){
                      $rootScope.$broadcast('api.created')
                      MessageService.success('Api created!')
                      $uibModalInstance.dismiss()
                  }).catch(function(err){
                  $log.error("Create new api error:", err)
                  $scope.errors = err.data.customMessage || {}


              })
          }


          function clearApi() {
              for(var key in $scope.api) {
                  if($scope.api[key] == '') {
                      delete($scope.api[key])
                  }
              }
          }


      }
    ])
  ;
}());
