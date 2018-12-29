/**
 * This file contains all necessary Angular controller definitions for 'frontend.admin.login-history' module.
 *
 * Note that this file should only contain controllers and nothing else.
 */
(function() {
    'use strict';

    angular.module('frontend.upstreams')
        .controller('UpstreamsController', [
            '_','$scope', '$rootScope','$q','$log','UserModel',
            'SocketHelperService','UserService','SettingsService','MessageService',
            '$state','$uibModal','DialogService','Upstream','$localStorage', 'DataModel',
            'ListConfig',
            function controller(_,$scope, $rootScope,$q,$log,UserModel,
                                SocketHelperService, UserService,SettingsService, MessageService,
                                $state, $uibModal,DialogService,Upstream,$localStorage, DataModel,
                                ListConfig ) {


                Upstream.setScope($scope, false, 'items', 'itemCount');
                $scope = angular.extend($scope, angular.copy(ListConfig.getConfig('upstream',Upstream)));
                $scope.user = UserService.user();

                const Alert = new DataModel('api/upstreamalert', true);
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
                        controller: 'AlertsModalController',
                        controllerAs: '$ctrl',
                        size: 'lg',
                        resolve: {
                            _upstreams: function () {
                                return _.get($scope, 'items.data', []);
                            }
                        }
                    });
                }


                function _fetchData(){
                    $scope.loading  = true;

                    Upstream.load({
                        size: $scope.itemsFetchSize
                    }).then(function(response){
                        $scope.items = response
                        $scope.loading  = false;
                    });
                }

                function countAlerts() {
                    Alert.count({
                        connection : _.get($scope, 'user.node.id')
                    }).then(data => {
                        $scope.alertsCount = data.count;
                    })
                }


                // Listeners
                $scope.$on('kong.upstream.created',function(ev,data){
                    _fetchData();
                });


                $scope.$on('user.node.updated',function(ev,node){
                    if(UserService.user().node.kong_version == '0-9-x'){
                        $state.go('dashboard')
                    }else{
                        _fetchData()
                    }

                });


                _fetchData()

                countAlerts();

            }
        ])
    ;
}());