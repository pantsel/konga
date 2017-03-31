/**
 * This file contains all necessary Angular controller definitions for 'frontend.admin.login-history' module.
 *
 * Note that this file should only contain controllers and nothing else.
 */
(function() {
    'use strict';

    angular.module('frontend.upstreams')
        .controller('UpstreamsController', [
            '_','$scope', '$rootScope','$q','$log','$ngBootbox','UserModel',
            'SocketHelperService','UserService','SettingsService','MessageService',
            '$state','$uibModal','DialogService','Upstream','$localStorage',
            'ListConfig',
            function controller(_,$scope, $rootScope,$q,$log,$ngBootbox,UserModel,
                                SocketHelperService, UserService,SettingsService, MessageService,
                                $state, $uibModal,DialogService,Upstream,$localStorage,
                                ListConfig ) {


                Upstream.setScope($scope, false, 'items', 'itemCount');
                $scope.deleteItem = deleteItem
                $scope.deleteChecked = deleteChecked

                // Add default list configuration variable to current scope
                $scope = angular.extend($scope, angular.copy(ListConfig.getConfig()));

                // Set initial data
                $scope.loading = false
                $scope.items = []
                $scope.totalItems = 0

                // Initialize used title items
                $scope.titleItems = ListConfig.getTitleItems('upstream');


                $scope.sort = {
                    column: 'created_at',
                    direction: true
                };

                // Initialize filters
                $scope.filters = {
                    searchWord: '',
                    columns: $scope.titleItems
                };

                $scope.changeSort = function changeSort(item) {
                    var sort = $scope.sort;

                    if (sort.column === item.column) {
                        sort.direction = !sort.direction;
                    } else {
                        sort.column = item.column;
                        sort.direction = true;
                    }
                };

                $scope.globalCheck = {
                    isAllChecked : false
                };

                $scope.$watch('globalCheck.isAllChecked', function watcher(valueNew, valueOld) {
                    if (valueNew !== valueOld) {
                        checkItems(valueNew)
                    }
                });

                function checkItems(checked) {
                    $scope.items.forEach(function(item){
                        item.checked = checked
                    })
                }


                $scope.openEditItemModal = function(item) {

                    $uibModal.open({
                        animation: true,
                        ariaLabelledBy: 'modal-title',
                        ariaDescribedBy: 'modal-body',
                        templateUrl: 'js/app/upstreams/add-upstream-modal.html',
                        controller: 'UpdateUpstreamModalController',
                        controllerAs: '$ctrl',
                        resolve : {
                            _item : function() {
                                return item
                            }
                        }
                        //size: 'lg',
                    });
                }

                $scope.openCreateItemModal = function() {

                    $uibModal.open({
                        animation: true,
                        ariaLabelledBy: 'modal-title',
                        ariaDescribedBy: 'modal-body',
                        templateUrl: 'js/app/upstreams/add-upstream-modal.html',
                        controller: 'AddUpstreamModalController',
                        controllerAs: '$ctrl',
                        //size: 'lg',
                    });
                }


                function _fetchData(){
                    var config = ListConfig.getConfig();

                    var parameters = {
                        size: config.itemsFetchSize
                    };

                    Upstream.load(_.merge({}, parameters)).then(function(response){
                        $scope.items = response.data
                    });
                }

                function deleteChecked() {

                    var items = []
                    $scope.items.forEach(function(item){
                        if(item.checked) items.push(item)
                    })

                    if(!items.length) {
                        MessageService.error('You have not selected any upstreams to delete')
                        return false
                    }

                    DialogService.prompt(
                        "Delete Upstreams","Really want to delete the selected upstreams?",
                        ['No don\'t','Yes! delete them'],
                        function accept(){
                            deleteItems(items)
                        },function decline(){})

                }

                function deleteItems(items) {

                    $scope.deleting = true;
                    var promises = []
                    items.forEach(function(item){
                        promises.push(Upstream.delete(item.id))
                    })

                    $q
                        .all(promises)
                        .finally(
                            function onFinally() {
                                $scope.deleting = false;
                                _fetchData()
                            }
                        )
                    ;
                }


                // Listeners
                $scope.$on('kong.upstream.created',function(ev,data){
                    _fetchData()
                })



                function deleteItem(item) {
                    DialogService.prompt(
                        "Delete Upstream","Really want to delete the selected upstream?",
                        ['No don\'t','Yes! delete it'],
                        function accept(){
                            doDeleteItem(item)
                        },function decline(){})
                }

                function doDeleteItem(item) {
                    Upstream.delete(item.id)
                        .then(function(res){
                            $log.debug("Delete upstream",res)
                            if(res.status == 204) {
                                _fetchData()
                                MessageService.success('Upstream deleted successfully');
                            }

                        })
                }



                $scope.$on('kong.node.updated',function(node){
                    _fetchData()
                })


                _fetchData()



            }
        ])
    ;
}());