/**
 * This file contains all necessary Angular directive definitions for 'frontend.core.layout' module.
 *
 * Note that this file should only contain directives and nothing else.
 */
(function() {
  'use strict';

  /**
   * Directive to build file links to information modal about current GUI. Actual files are passed to this directive
   * within modal open function.
   */
  angular.module('frontend.core.layout')
    .directive('pageInfoFiles', function directive() {
      return {
        restrict: 'E',
        replace: true,
        scope: {
          'files': '@'
        },
        templateUrl: 'js/app/core/layout/partials/files.html',
        controller: [
          '$scope',
          function controller($scope) {
            try {
              $scope.filesJson = angular.fromJson($scope.files);
            } catch (error) {
              $scope.filesJson = false;
            }

            $scope.getTooltip = function getTooltip(item) {
              return '<h5 class="title">' + item.title + '</h5>' + item.info;
            };
          }
        ]
      };
    })
  ;
}());
