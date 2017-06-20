(function() {
    'use strict';

    /**
     * Model for Author API, this is used to wrap all Author objects specified actions and data change actions.
     */
    angular.module('frontend.consumers')
        .service('PluginModel', [
            'DataModel','DataService','$q','$log',
            function(DataModel,DataService,$q,$log) {

                var model = new DataModel('kong/plugins',true);


                model.handleError = function($scope,err) {
                    $scope.errors = {}
                    if(err.data){

                        for(var key in err.data.invalidAttributes){
                            $scope.errors[key] = err.data.invalidAttributes[key][0].message
                        }

                        // Passport errors
                        if(err.data.raw && err.data.raw.length) {
                            err.data.raw.forEach(function(raw){
                                for(var key in raw.err.invalidAttributes){
                                    $scope.errors[key] = raw.err.invalidAttributes[key][0].message
                                }
                            })
                        }
                    }
                }

                return model;
            }
        ])
    ;
}());