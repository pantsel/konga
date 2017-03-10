(function() {
    'use strict';

    /**
     * Model for Author API, this is used to wrap all Author objects specified actions and data change actions.
     */
    angular.module('frontend.users')
        .service('UserModel', [
            'DataModel','DataService','$q','$log',
            function(DataModel,DataService,$q,$log) {

                var model = new DataModel('user');

                model.handleError = function($scope,err) {
                    console.log("errrrrrrrrrrrrr",err)
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
                //
                //model.create = function create(data) {
                //    var self = this;
                //    var defer = $q.defer()
                //
                //    if(data.passports.password !== data.password_confirmation) {
                //
                //        defer.reject({
                //            data: {
                //                invalidAttributes: {
                //                    password_confirmation: [
                //                        {message: "Password and password confirmation don't match"}
                //                    ]
                //                }
                //            }
                //        })
                //    }else{
                //        DataService
                //            .create(self.endpoint, data)
                //            .then(
                //                function onSuccess(result) {
                //                    defer.resolve(result);
                //                },
                //                function onError(error) {
                //                    $log.error('DataModel.create() failed.', error, self.endpoint, data);
                //                    defer.reject(error)
                //                }
                //            )
                //    }
                //
                //
                //
                //    return defer.promise
                //};
                //
                //return model
            }
        ])
    ;
}());