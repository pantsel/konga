/**
 * Directive to create search component for lists. This is used generally in all lists on application. Basically
 * this directive just manipulates given filters and items per page variables. Directive needs three attributes to
 * work:
 *  1) filters, filter data
 *  2) options, items per page options
 *  3) items, current items per page value
 *
 * Passed filters must be in following format:
 *  $scope.filters = {
 *    searchWord: '',
 *    columns: $scope.items
 *  };
 *
 * Where '$scope.items' is array of objects like:
 *  $scope.items = [
 *    {
 *      title: 'Object',
 *      column: 'objectName',
 *      searchable: true,
 *      sortable: true,
 *      inSearch: true,
 *      inTitle: true
 *    },
 *  ];
 *
 * Usage example:
 *
 *  <list-search
 *      data-filters="filters"
 *      data-options="itemsPerPageOptions"
 *      data-items="itemsPerPage"
 *  ></list-search>
 */
(function() {
  'use strict';

  angular.module('frontend.core.directives')
    .directive('listSearch', function directive() {
      return {
        restrict: 'E',
        scope: {
          filters: '=',
          items: '=',
          options: '='
        },
        replace: true,
        templateUrl: '/frontend/core/directives/partials/ListSearch.html',
        controller: [
          '$scope',
          function controller($scope) {
            $scope.id = Math.floor((Math.random() * 6) + 1);

            $scope.inSearch = function inSearch(item) {
              return (!angular.isUndefined(item.searchable)) ? item.searchable : false;
            };
          }
        ]
      };
    })
  ;
}());
