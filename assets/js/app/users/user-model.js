(function() {
    'use strict';

    /**
     * Model for User API, this is used to wrap all User objects specified actions and data change actions.
     */
    angular.module('frontend.users')
        .service('UserModel', [
            'DataModel','DataService','$q','$log','$http',
            function(DataModel,DataService,$q,$log,$http) {

                var model = new DataModel('user');

                model.handleError = function($scope,err) {
                    $scope.errors = {}
                    if(err.data){

                        if(err.data.Errors) {
                            Object.keys(err.data.Errors).forEach(function (key) {
                                $scope.errors[key] = err.data.Errors[key][0].message
                            })
                        }

                        for(var key in err.data.invalidAttributes){
                            $scope.errors[key] = err.data.invalidAttributes[key][0].message
                        }
                        //
                        // Passport errors
                        if(err.data.raw && err.data.raw.length) {
                            err.data.raw.forEach(function(raw){
                                for(var key in raw.err.invalidAttributes){
                                    $scope.errors[key] = raw.err.invalidAttributes[key][0].message
                                }
                            })
                        }
                        //
                        // if(err.data.failedTransactions && err.data.failedTransactions.length) {
                        //     err.data.failedTransactions.forEach(function(failedTrans){
                        //         if(failedTrans.err && failedTrans.err.invalidAttributes){
                        //             for(var key in failedTrans.err.invalidAttributes){
                        //
                        //                 if(key == 'password') {
                        //                     failedTrans.err.invalidAttributes[key].forEach(function(item){
                        //
                        //                         if(item.rule == 'minLength') {
                        //                             $scope.errors[key] = "The password must be at least 7 characters long."
                        //                         }
                        //
                        //                     })
                        //                 }
                        //
                        //                 if(key == 'username') {
                        //                     failedTrans.err.invalidAttributes[key].forEach(function(item){
                        //
                        //                         if(item.rule == 'minLength') {
                        //                             $scope.errors[key] = "The username must be at least 7 characters long."
                        //                         }
                        //
                        //                     })
                        //                 }
                        //
                        //             }
                        //         }
                        //
                        //     })
                        // }
                    }
                }

                model.signup = function signup(data) {
                    return $http.post('auth/signup',data)
                }

                return model;

            }
        ])
    ;
}());