(function() {
    'use strict';

    /**
     * Model for Author API, this is used to wrap all Author objects specified actions and data change actions.
     */
    angular.module('frontend.consumers')
        .service('ConsumerModel', [
            'DataModel','DataService','$q','$log',
            function(DataModel,DataService,$q,$log) {

                var model = new DataModel('consumer');


                model.load = function load(parameters, fromCache) {
                    var self = this;

                    // Normalize parameters
                    parameters = parameters || {};
                    fromCache = fromCache || false;

                    if (fromCache) {
                        parameters = self.cache.load.parameters;
                    } else {
                        // Store used parameters
                        self.cache.load = {
                            parameters: parameters
                        };
                    }

                    return DataService
                        .collection(self.endpoint, parameters)
                        .then(
                            function onSuccess(response) {
                                self.objects = response.data;

                                if (fromCache && self.scope && self.itemNames.objects) {
                                    self.scope[self.itemNames.objects] = self.objects;
                                }

                                return self.objects;
                            },
                            function onError(error) {
                                $log.error('DataModel.load() failed.', error, self.endpoint, parameters);
                            }
                        )
                        ;
                };

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