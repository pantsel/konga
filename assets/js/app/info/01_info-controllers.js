/**
 * This file contains all necessary Angular controller definitions for 'frontend.admin.login-history' module.
 *
 * Note that this file should only contain controllers and nothing else.
 */
(function() {
  'use strict';

  angular.module('frontend.info')
    .controller('InfoController', [
      '$scope', '$log', '$state','InfoService','_info',
      function controller($scope, $log, $state,InfoService,_info) {

          $scope.info = _info.data


          $scope.$on('kong.node.updated',function(node){
              InfoService.getInfo()
                  .then(function(response){
                      $scope.info = response.data
                  })
          })

      }
    ])
  ;
}());
