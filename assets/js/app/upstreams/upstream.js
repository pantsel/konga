(function () {
  'use strict';

  /**
   * Model for Author API, this is used to wrap all Author objects specified actions and data change actions.
   */
  angular.module('frontend.upstreams')
    .service('Upstream', [
      'DataModel','DataService','$log',
      function (DataModel, DataService, $log) {

        var model = new DataModel('kong/upstreams', true);

        model.health = function fetch(identifier, parameters, fromCache) {
          var self = this;

          // Normalize parameters
          parameters = parameters || {};
          fromCache = fromCache || false;

          if (fromCache) {
            identifier = self.cache.fetch.identifier;
            parameters = self.cache.fetch.parameters;
          } else {
            // Store identifier and used parameters to cache
            self.cache.fetch = {
              identifier: identifier,
              parameters: parameters
            };
          }

          return DataService
            .get(self.endpoint + '/' + identifier  + '/health', parameters)
            .then(
              function onSuccess(response) {
                self.object = response.data;

                if (fromCache && self.scope && self.itemNames.object) {
                  self.scope[self.itemNames.object] = self.object;
                }

                return self.object;
              },
              function onError(error) {
                $log.error('Upstream.health() failed.', error, self.endpoint, identifier, parameters);
              }
            )
            ;
        };

        model.handleError = function ($scope, err) {
          $scope.errors = {}
          if (err.data && err.data.body) {

            for (var key in err.data.body) {
              $scope.errors[key] = err.data.body[key]
            }
          }
        }

        return model;

      }
    ])
  ;
}());