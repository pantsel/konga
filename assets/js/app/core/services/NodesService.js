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
            'NodeModel', '$q','$state','$localStorage',
            function factory(NodeModel, $q, $state, $localStorage) {
                return {
                    activeNode : function() {
                        return $localStorage.credentials.user.node
                    },
                    authorize: function authorize(needsActiveNode) {
                        if(needsActiveNode)
                            return $localStorage.credentials && $localStorage.credentials.user.node
                        return true;
                    },
                    isActiveNodeSet : function() {
                        var defer = $q.defer()

                        if($localStorage.credentials.user.node){
                            defer.resolve($localStorage.credentials.user.node.id)
                        }else{
                            $state.go('connections')
                            defer.reject("No active nodes found")

                        }
                        return defer.promise
                    }
                }
            }
        ])
    ;
}());
