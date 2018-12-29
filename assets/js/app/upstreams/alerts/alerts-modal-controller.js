/**
 * This file contains all necessary Angular controller definitions for 'frontend.admin.login-history' module.
 *
 * Note that this file should only contain controllers and nothing else.
 */
(function() {
    'use strict';

    angular.module('frontend.upstreams')
        .controller('AlertsModalController', [
            '_','$scope', '$rootScope','$q','$log','UserModel',
            'SocketHelperService','UserService','SettingsService','MessageService',
            '$state','DialogService','Upstream','$localStorage', 'DataModel',
            'ListConfig', '$uibModalInstance', '_upstreams',
            function controller(_,$scope, $rootScope,$q,$log,UserModel,
                                SocketHelperService, UserService,SettingsService, MessageService,
                                $state,DialogService,Upstream,$localStorage, DataModel,
                                ListConfig, $uibModalInstance, _upstreams ) {


                const Alert = new DataModel('api/upstreamalert', true);
                Alert.setScope($scope, false, 'items', 'itemCount');
                $scope = angular.extend($scope, angular.copy(ListConfig.getConfig('upstreamAlert',Alert)));
                $scope.user = UserService.user();

                $scope.close = () => {
                    $uibModalInstance.dismiss()
                }


                $scope.alertsCount = 0;

                $scope.openCreateItemModal = function() {

                    $uibModal.open({
                        animation: true,
                        ariaLabelledBy: 'modal-title',
                        ariaDescribedBy: 'modal-body',
                        templateUrl: 'js/app/upstreams/add-upstream-modal.html?v=' + $rootScope.konga_version,
                        controller: 'AddUpstreamModalController',
                        controllerAs: '$ctrl',
                        //size: 'lg',
                    });
                };

                $scope.openAlertsListModal = () => {
                    $uibModal.open({
                        animation: true,
                        ariaLabelledBy: 'modal-title',
                        ariaDescribedBy: 'modal-body',
                        templateUrl: 'js/app/upstreams/alerts/alerts-modal.html?v=' + $rootScope.konga_version,
                        controller: 'AddUpstreamModalController',
                        controllerAs: '$ctrl',
                        //size: 'lg',
                    });
                }


                function _fetchData(){
                    $scope.loading  = true;

                    Alert.load({
                        connection: _.get($scope.user,'node.id'),
                        populate: 'connection'
                    }).then(function(response){
                        response.forEach(item => {
                            item.upstream = _.find(_upstreams, upstream => item.upstream_id === upstream.id)
                        })
                        $scope.items = response
                        console.log("Loaded alerts =>", $scope.items);
                        $scope.loading  = false;
                    });
                }

                _fetchData();
            }
        ])
    ;
}());