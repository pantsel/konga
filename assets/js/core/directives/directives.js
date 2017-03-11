// Generic models angular module initialize.
(function() {
  'use strict';

  angular.module('frontend.core.directives', [])
      .directive('onKeyEnter', function () {
        return function (scope, element, attrs) {
          element.bind("keydown keypress", function (event) {
            if(event.which === 13) {
              scope.$apply(function (){
                scope.$eval(attrs.onKeyEnter);
              });

              event.preventDefault();
            }
          });
        };
      });
}());
