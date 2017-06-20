(function() {
    'use strict';

    /**
     * Model for Author API, this is used to wrap all Author objects specified actions and data change actions.
     */
    angular.module('frontend.cluster')
        .controller('ClusterListController', [
            '$scope','Cluster', 'ListConfig', function($scope,Cluster,ListConfig) {

                Cluster.setScope($scope, false, 'items', 'itemCount');
                $scope = angular.extend($scope, angular.copy(ListConfig.getConfig('cluster.nodes',Cluster)));


                function _fetchData() {
                    $scope.loading = true;
                    Cluster.load({
                        size : $scope.itemsFetchSize
                    }).then(function(response){
                        $scope.items = response;
                        $scope.loading= false;
                    })
                }

                _fetchData();


                $scope.$on('user.node.updated',function(node){
                    fetchData();
                })

            }
        ])
    ;
}());