
(function() {
  'use strict';

  angular.module('frontend.core.directives')
    .directive('rawView', function directive() {
      return {
        restrict: 'E',
        scope: {
          item: '='
        },
        replace: true,
        template : '<i uib-tooltip="Raw view" class="material-icons clickable" data-ng-click="openRawView(item)">remove_red_eye</i>',
        controller: [
          '$scope','$uibModal',
          function controller($scope,$uibModal) {

            $scope.openRawView = function(item) {
              $uibModal.open({
                animation: true,
                ariaLabelledBy: 'modal-title',
                ariaDescribedBy: 'modal-body',
                template: '<div class="modal-body no-padding">' +
                '<pre class="no-margin">{{item | json}}</pre>' +
                '</div>',
                controller: function($scope,_item){
                  $scope.item = _item
                },
                controllerAs: '$ctrl',
                resolve: {
                  _item: function () {
                    return item;
                  }
                }
              });
            }

          }
        ]
      };
    })
  ;
}());
