'use strict';

angular.module('frontend.core.interceptors')
    .factory('CsrfInterceptor' , [
    '$q','$injector',function($q , $injector){
        var _token = false;
        return {
            request : function(config){
                var CSRF_URL = '/csrfToken';



                if(config.url == CSRF_URL || config.method == "GET"){
                    return config;
                }

                if(!config.data) config.data = {}

                // sailsjs hasn't time limit for csrf token, so it is safe to cache this
                // remove this to request a new token
                if(_token){
                    config.data._csrf = _token;
                    return config;
                }

                var deferred = $q.defer();
                var $http = $injector.get('$http');
                $http.get(CSRF_URL).success(function(response , status , headers){
                    if(response._csrf){
                        _token = response._csrf;
                        config.data._csrf = _token;
                        //config.headers['X-CSRF-Token'] = response._csrf;
                    }
                    deferred.resolve(config);
                }).error(function(response , status , headers){
                    deferred.reject(response);
                });

                return deferred.promise;
            }
        }
    }]);
