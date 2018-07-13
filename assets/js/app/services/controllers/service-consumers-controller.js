/**
 * This file contains all necessary Angular controller definitions for 'frontend.login-history' module.
 *
 * Note that this file should only contain controllers and nothing else.
 */
(function () {
  'use strict';

  angular.module('frontend.services')
    .controller('ServiceConsumersController', [
      '_', '$scope', '$rootScope', '$stateParams', '$log', '$state', 'ServiceService','ConsumerModel','ListConfig',
      function controller(_, $scope, $rootScope, $stateParams, $log, $state, ServiceService, ConsumerModel, ListConfig) {


        ConsumerModel.setScope($scope, false, 'items', 'itemCount');
        $scope = angular.extend($scope, angular.copy(ListConfig.getConfig('consumerWithCreds',ConsumerModel)));
        $scope.search = '';
        $scope.explanatoryMessage = 'Listing consumers: ';


        var availableOnServer = angular.copy($rootScope.Gateway.plugins.available_on_server);
        var enabledPlugins = [];

        Object.keys(availableOnServer).forEach(function(key) {
          if(availableOnServer[key]) enabledPlugins.push(key);
        })

        $scope.loading = true;
        ServiceService.consumers($scope.service.id)
          .then(function (response) {
            console.log("GOT SERVICE CONSUMERS", response.data)
            if (response.data.total > 0) {
              $scope.items = response.data;
              $scope.loading = false;

              if(response.data.acl && response.data.acl.config.whitelist && response.data.acl.config.whitelist.length) {
                $scope.explanatoryMessage += `<br> - included in one of the groups: <strong>${response.data.acl.config.whitelist.join(", ")}</strong>, `
              }

              if(response.data.acl && response.data.acl.config.blacklist && response.data.acl.config.blacklist.length) {
                $scope.explanatoryMessage += `<br> - excluded from any of the groups: <strong>${response.data.acl.config.blacklist.join(", ")}</strong>, `
              }

              if(response.data.authenticationPlugins) {
                $scope.explanatoryMessage += `<br> - carrying at least one of the following credentials: <strong>${response.data.authenticationPlugins.join(", ")}</strong>, `
              }

            } else {
              $scope.isOpenService = true;
              $scope.loading = false;
            }
          }).catch(function (err) {
          console.error("FAILED TO GET SERVICE CONSUMERS", err);
          $scope.loading = false;
        })


      }
    ])
  ;
}());
