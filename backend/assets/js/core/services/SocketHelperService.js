/**
 * Simple angular service to parse search filters for socket queries. Usage example:
 *
 *  $sailsSocket
 *    .get("/Book/", {
 *      params: {
 *        where: SocketHelperService.getWhere($scope.filters)
 *      }
 *    })
 *    .then(
 *      function successCb(response) {
 *        // Do your data handling here
 *      }
 *      function errorCb(response) {
 *        // Do your error handling here
 *      }
 *    );
 *
 * @todo add more complex parameter handling
 */
(function() {
  'use strict';

  angular.module('frontend.core.services')
    .factory('SocketHelperService', [
      '_',
      function factory(_) {
        return {
          getWhere: function getWhere(filters, defaults) {
            var output = defaults || {};

            // Determine search columns
            var columns = _.filter(filters.columns, function iterator(column) {
              return column.inSearch;
            });

            // Determine search words
            var words = _.filter(filters.searchWord.split(' '));

            // We have some search word(s) and column(s)
            if (columns.length > 0 && words.length > 0) {
              var conditions = [];

              // Iterate each columns
              _.forEach(columns, function iteratorColumns(column) {
                // Iterate each search word
                _.forEach(words, function iteratorWords(word) {
                  var condition = {};

                  // Create actual condition and push that to main condition
                  condition[column.column] = {contains: word};

                  conditions.push(condition);
                });
              });

              output = {or: conditions};
            }

            return output;
          }
        };
      }
    ])
  ;
}());