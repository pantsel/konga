/**
 * This file contains all necessary Angular controller definitions for 'frontend.admin.login-history' module.
 *
 * Note that this file should only contain controllers and nothing else.
 */
(function() {
    'use strict';

    angular.module('frontend.snapshots')
        .service('SnapshotsService', [
            '$http',
            function($http ) {
                return {
                    takeSnapshot : function(name,node_id) {
                        return $http.post('api/snapshots/take',{
                            name : name,
                            node_id : node_id
                        });
                    },
                    snapshot : function(name,node_id) {
                        return $http.post('api/snapshots/snapshot',{
                            name : name,
                            node_id : node_id
                        });
                    },
                    restoreSnapshot : function(id,imports) {
                        return $http.post('api/snapshots/' + id + '/restore',{
                            imports : imports
                        });
                    },
                    restore : function(id,imports) {
                        return $http.post('api/snapshots/' + id + '/restore',{
                            imports : imports
                        });
                    }
                };


            }
        ])
    ;
}());