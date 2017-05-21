(function() {
    'use strict';

    /**
     * Model for Author API, this is used to wrap all Author objects specified actions and data change actions.
     */
    angular.module('frontend.cluster')
        .service('Cluster', [
            'DataModel','DataService',
            function(DataModel,DataService) {

                var model = new DataModel('kong/cluster',true);

                model.delete = function deleteObject(identifier) {
                    var self = this;

                    return DataService
                        .delete(self.endpoint + '/nodes', identifier)
                };

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