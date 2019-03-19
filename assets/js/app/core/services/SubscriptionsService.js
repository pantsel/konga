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
        .factory('SubscriptionsService', [
            '$log','$rootScope','AuthService',
            function factory($log,$rootScope,AuthService) {

                var hasSubscribed = false;

                function _subscribe() {

                    io.socket.get('api/kongnodes/healthchecks/subscribe?token=' + AuthService.token(),
                        function (data, jwr) {

                            if (jwr.statusCode == 200) {
                                console.log("Subscribed to room",data.room)
                                io.socket.on(data.room, function (obj) {
                                    //$log.info("Notification received",obj)
                                    $rootScope.$broadcast("node.health_checks", obj)

                                });
                            } else {
                                console.log("Failed to subscribe to: ", jwr);
                            }
                        });
                    //
                    // io.socket.get('api/apis/healthchecks/subscribe?token=' + AuthService.token(),
                    //     function (data, jwr) {
                    //         //$log.info("ApiHealthChecksSub:data",data)
                    //         //$log.info("ApiHealthChecksSub:jwr",jwr)
                    //
                    //         if (jwr.statusCode == 200) {
                    //             $log.info("Subscribed to room",data.room)
                    //             io.socket.on(data.room, function (obj) {
                    //                 //$log.info("Notification received",obj)
                    //                 $rootScope.$broadcast("api.health_checks", obj)
                    //
                    //             });
                    //         } else {
                    //             $log.info(jwr);
                    //         }
                    //     });

                    // io.socket.get('/api/snapshots/subscribe?token=' + AuthService.token(),
                    //     function (data, jwr) {
                    //         // $log.info("SnapshotsSub:data",data)
                    //         //$log.info("ApiHealthChecksSub:jwr",jwr)
                    //
                    //         if (jwr.statusCode == 200) {
                    //             $log.info("Subscribed to room",data.room)
                    //             io.socket.on(data.room, function (obj) {
                    //                 $log.info("Notification received",obj)
                    //                 $rootScope.$broadcast("snapshots." + obj.verb, obj)
                    //
                    //             });
                    //         } else {
                    //             $log.info(jwr);
                    //         }
                    //     });

                    hasSubscribed = true;


                }

                function onInit() {
                    if(hasSubscribed) {
                        return false;
                    }

                    if (!io.socket.isConnecting) {
                        _subscribe()
                    }
                    io.socket.on('connect', function () {
                        _subscribe()
                    });
                }




                return {

                    init : function() {

                        if(AuthService.isAuthenticated()){
                            onInit();
                        }

                        $rootScope.$on('user.login', function(ev,user){
                            onInit();
                        })


                    }

                }
            }
        ])
    ;
}());
