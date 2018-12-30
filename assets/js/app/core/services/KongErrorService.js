
(function () {
  'use strict';

  angular.module('frontend.core.services')
    .service('KongErrorService', ['MessageService',
      function service(MessageService) {

        return {
          handle: ($scope, err) => {
            $scope.errors = {}
            const errorBody = _.get(err, 'data.body');
            if (errorBody) {
              if (errorBody.fields) {

                for (let key in errorBody.fields) {
                  $scope.errors[key] = errorBody.fields[key]
                }
              }
              $scope.errorMessage = errorBody.message || '';
            } else {
              $scope.errorMessage = "An unknown error has occured"
            }

            MessageService.error($scope.errorMessage);
          }
        }
      }

    ])
  ;
}());
