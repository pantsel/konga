/**
 * This file contains all necessary Angular controller definitions for 'frontend.admin.login-history' module.
 *
 * Note that this file should only contain controllers and nothing else.
 */
(function() {
  'use strict';

  angular.module('frontend.admin.info')
    .controller('AdminInfoController', [
      '$scope', '$log', '$state','_info',
      function controller($scope, $log, $state,_info) {

          $scope.info = _info.data

      }
    ])
  ;
}());
