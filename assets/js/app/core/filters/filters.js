// Generic models angular module initialize.
(function() {
  'use strict';

  angular.module('frontend.core.filters', [])

  angular.module('frontend.core.filters')
      .filter('to_trusted', ['$sce', function($sce){
        return function(text) {
          return $sce.trustAsHtml(text);
        };
      }]);;
}());
