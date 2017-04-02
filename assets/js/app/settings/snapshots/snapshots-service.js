/**
 * This file contains all necessary Angular controller definitions for 'frontend.admin.login-history' module.
 *
 * Note that this file should only contain controllers and nothing else.
 */
(function() {
    'use strict';

    angular.module('frontend.settings')
        .service('SnapshotsService', [
            '$http',
            function($http ) {
                return {
                    takeSnapshot : function(name) {
                        return $http.post('api/snapshots/take',{
                            name : name
                        })
                    },
                    restoreSnapshot : function(id,imports) {
                        return $http.post('api/snapshots/' + id + '/restore',{
                            imports : imports
                        })
                    }
                }


            }
        ])
    ;
}());