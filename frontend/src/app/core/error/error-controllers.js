/**
 * This file contains all necessary Angular controller definitions for 'frontend.core.error' module.
 *
 * Note that this file should only contain controllers and nothing else.
 */
(function() {
  'use strict';

  /**
   * Controller for generic error handling.
   */
  angular.module('frontend.core.error')
    .controller('ErrorController', [
      '$scope', '$state',
      '_',
      '_error',
      function controller(
        $scope, $state,
        _,
        _error
      ) {
        if (_.isUndefined(_error)) {
          return $state.go('auth.login');
        }

        $scope.error = _error;

      }
    ])
  ;
}());
