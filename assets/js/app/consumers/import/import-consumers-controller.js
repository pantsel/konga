/**
 * This file contains all necessary Angular controller definitions for 'frontend.admin.login-history' module.
 *
 * Note that this file should only contain controllers and nothing else.
 */
(function() {
    'use strict';

    angular.module('frontend.consumers')
        .controller('ImportConsumersController', [
            '_','$scope', '$rootScope','$log', '$state','ConsumerService','$q','MessageService',
            '$uibModal','$uibModalInstance','_consumers',
            function controller(_,$scope, $rootScope,$log, $state, ConsumerService,$q,MessageService,
                                $uibModal, $uibModalInstance,_consumers) {

                $scope.consumers = _consumers;
                $scope.importing = true;
                $scope.percent = 0
                $scope.count = 0
                $scope.result = {
                    imported : {
                        count : 0,
                        consumers : []
                    },
                    failed : {
                        count : 0,
                        consumers : []
                    },
                }

                $scope.uuid = new Date().getTime()


                $scope.closeModal = function() {
                    $uibModalInstance.dismiss();
                }


                // Start importing
                var imports = [];

                _consumers.forEach(function(consumer){
                    var _import = ConsumerService.
                        create({
                        username : consumer.username,
                        custom_id : consumer.custom_id,
                        // import_id : $scope.uuid,
                    })

                    .catch(function(error) {
                        $scope.count ++;
                        $scope.result.failed.count++
                        $scope.result.failed.consumers.push(consumer)
                        $scope.percent = ($scope.count * 100) / $scope.consumers.length;
                        return { error:error };
                    })
                        .finally(
                            function onSuccess() {
                                $scope.count ++;
                                $scope.percent = ($scope.count * 100) / $scope.consumers.length;

                            })

                    imports.push(_import)
                })


                $q
                    .all(imports)
                    .then(function(results) {

                        console.log("res",results)
                        results.forEach(function(result){
                            if(!result.error) {
                                $scope.result.imported.count++
                                $scope.result.imported.consumers.push(result.data)
                            }
                        })
                        $scope.importing = false;
                        $rootScope.$broadcast('consumer.created')
                    })





            }
        ])
}());
