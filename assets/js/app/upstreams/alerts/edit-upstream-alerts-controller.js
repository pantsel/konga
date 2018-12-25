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
      '$log', '$state', 'Upstream', 'MessageService', '$uibModal', 'DataModel', 'ListConfig', '$http', 'DialogService',
      function controller(_, $scope, $rootScope, $stateParams,
                          $log, $state, Upstream, MessageService, $uibModal, DataModel, ListConfig, $http, DialogService) {


        console.log("Loaded EditUpstreamAlertsController");
        const Alert = new DataModel('api/upstreamalert', true);

        $scope.alert = {
          active: false
        }

        Alert.load({
          upstream_id: $stateParams.id
        }).then((data) => {
          if(data.length) $scope.alert = _.merge($scope.alert, data[0]);
          console.log("ALERT => ", $scope.alert);
        })


        $scope.toggleAlerts = async () => {
          try{
            if($scope.alert.id) {
              const data = await Alert.update($scope.alert.id, {
                active: $scope.alert.active
              })
              console.log("Alert updated => ", data);
            } else {
              const data = await Alert.create({
                upstream_id: $stateParams.id,
                active: $scope.alert.active
              })
              console.log("Alert created => ", data);
              $scope.alert = data.data;
            }
          } catch (e) {
            console.error(e);
            MessageService.error('Something went wrong...')
          }
        }

      }
    ])
  ;
}());
