/**
 * Simple service to activate noty2 message to GUI. This service can be used every where in application. Generally
 * all $http and $socket queries uses this service to show specified errors to user.
 *
 * Service can be used as in following examples (assuming that you have inject this service to your controller):
 *  Message.success(message, [title], [options]);
 *  Message.error(message, [title], [options]);
 *  Message.message(message, [title], [options]);
 *
 * Feel free to be happy and code some awesome stuff!
 *
 * @todo do we need some queue dismiss?
 */
(function() {
    'use strict';

    angular.module('frontend.core.services')
        .factory('NodesService', [
            'NodeModel', '$q',
            function factory(NodeModel, $q) {
                return {
                    hasActiveNode : function() {
                        var defer = $q.defer()

                        NodeModel.load(_.merge({}, {
                            active:true
                        })).then(function(resp){
                            if(resp.data && resp.data.length) {
                                defer.resolve(resp.data[0])
                            }else{
                                defer.reject("No active nodes found")
                            }
                        }).catch(function(err){
                            defer.reject(err)
                        })

                        return defer.promise
                    }
                }
            }
        ])
    ;
}());
