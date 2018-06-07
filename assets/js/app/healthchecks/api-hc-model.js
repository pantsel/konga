(function() {
    'use strict';

    /**
     * Model for Author API, this is used to wrap all Author objects specified actions and data change actions.
     */
    angular.module('frontend.healthchecks')
        .service('ApiHealthCheck', [
            'DataModel',
            function(DataModel) {

                var model = new DataModel('apihealthcheck');


                model.handleError = function($scope,err) {
                    $scope.errors = {}
                    if(err.data && err.data.body){

                        Object.keys(err.data.body).forEach(function(key){
                            $scope.errors[key] = err.data.body[key];
                        });
                    }
                }

                return model;
            }
        ])
    ;
}());