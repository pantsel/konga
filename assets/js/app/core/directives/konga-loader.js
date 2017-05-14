
(function() {
  'use strict';

  angular.module('frontend.core.directives')
    .directive('kongaLoader', function directive() {
      return {
        restrict: 'E',
        scope: {
          message: '@'
        },
        replace: true,
        templateUrl: 'js/app/core/directives/partials/konga-loader.html',
        controller: [
          '$scope','$rootScope',
          function controller($scope,$rootScope) {

          }
        ]
      };
    })
  ;
}());
