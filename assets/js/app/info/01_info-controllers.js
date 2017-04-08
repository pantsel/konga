/**
 * This file contains all necessary Angular controller definitions for 'frontend.admin.login-history' module.
 *
 * Note that this file should only contain controllers and nothing else.
 */
(function() {
  'use strict';

  angular.module('frontend.info')
    .controller('InfoController', [
      '$scope', '$log', '$state','InfoService',
      function controller($scope, $log, $state,InfoService) {



          $scope.$on('kong.node.updated',function(node){
              InfoService.getInfo()
                  .then(function(response){
                      $scope.info = response.data
                  })
          })

          function _getInfo() {
              InfoService.getInfo()
                  .then(function(response){
                      $scope.info = response.data
                  })
          }

          _getInfo()

      }
    ])
  ;
}());
