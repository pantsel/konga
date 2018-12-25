/**
 * This file contains all necessary Angular controller definitions for 'frontend.login-history' module.
 *
 * Note that this file should only contain controllers and nothing else.
 */
(function () {
  'use strict';

  angular.module('frontend.upstreams')
    .controller('EditUpstreamAlertsController', [
      '_', '$scope', '$rootScope', '$stateParams',
      '$log', '$state', 'Upstream', 'MessageService', '$uibModal', 'DataModel',
      function controller(_, $scope, $rootScope, $stateParams,
                          $log, $state, Upstream, MessageService, $uibModal, DataModel) {


        console.log("Loaded EditUpstreamAlertsController");
        const Alert = new DataModel('api/upstreamalert', true);

        $scope.alert = {
          upstream_id: $stateParams.id,
          active: false
        }

        Alert.load({
          upstream_id: $stateParams.id
        }).then((data) => {
          if(data.length) $scope.alert = _.merge($scope.alert, data[0]);
          console.log("ALERT => ", $scope.alert);
        })


        $scope.alertChanged = async () => {

          $scope.alert.connection = $rootScope.user.node.id; // Always get user.node.id in case it's changed

          if($scope.alert.id) { // Update the alert
            const data = await Alert.update($scope.alert.id, _.omit($scope.alert, ['id']));
            console.log("Alert updated => ", data);
            $scope.alert = data.data;
          } else { // Create an alert for this upstream
            const data = await Alert.create($scope.alert)
            console.log("Alert created => ", data);
            $scope.alert = data.data;
          }

        }

      }
    ])
  ;
}());
