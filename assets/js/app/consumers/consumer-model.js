(function() {
    'use strict';

    /**
     * Model for Author API, this is used to wrap all Author objects specified actions and data change actions.
     */
    angular.module('frontend.consumers')
        .service('ConsumerModel', [
            'DataModel','MessageService','$q','$log',
            function(DataModel,MessageService,$q,$log) {

                var model = new DataModel('kong/consumers',true);


                model.handleError = function($scope,err) {
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

                return model;
            }
        ])
    ;
}());