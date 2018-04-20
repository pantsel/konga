(function() {
    'use strict';

    /**
     * Model for Author API, this is used to wrap all Author objects specified actions and data change actions.
     */
    angular.module('frontend.services')
        .service('ServiceHCModel', [
            'DataModel',
            function(DataModel) {

                var model = new DataModel('servicehealthcheck');

                model.handleError = function($scope,err) {
                    $scope.errors = {}
                    if(err.data){

                        for(var key in err.data.invalidAttributes){
                            $scope.errors[key] = err.data.invalidAttributes[key][0].message
                        }
                    }
                }

                return model;

            }
        ])
    ;
}());