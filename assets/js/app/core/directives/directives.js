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
      })
      .directive('fileSelect', ['$window', function ($window) {
          return {
              restrict: 'A',
              require: 'ngModel',
              link: function (scope, el, attr, ctrl) {
                  var fileReader = new $window.FileReader();

                  fileReader.onload = function () {
                      ctrl.$setViewValue(fileReader.result);

                      if ('fileLoaded' in attr) {
                          scope.$eval(attr['fileLoaded']);
                      }
                  };

                  fileReader.onprogress = function (event) {
                      if ('fileProgress' in attr) {
                          scope.$eval(attr['fileProgress'],
                              {'$total': event.total, '$loaded': event.loaded});
                      }
                  };

                  fileReader.onerror = function () {
                      if ('fileError' in attr) {
                          scope.$eval(attr['fileError'],
                              {'$error': fileReader.error});
                      }
                  };

                  var fileType = attr['fileSelect'];

                  el.bind('change', function (e) {
                      var fileName = e.target.files[0];

                      if (fileType === '' || fileType === 'text') {
                          fileReader.readAsText(fileName);
                      } else if (fileType === 'data') {
                          fileReader.readAsDataURL(fileName);
                      }
                  });
              }
          };
      }]);
}());
