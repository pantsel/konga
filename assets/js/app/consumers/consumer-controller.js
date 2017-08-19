/**
 * This file contains all necessary Angular controller definitions for 'frontend.admin.login-history' module.
 *
 * Note that this file should only contain controllers and nothing else.
 */
(function() {
  'use strict';

  angular.module('frontend.consumers')
    .controller('ConsumerController', [
      '_','$scope', '$log', '$state','_consumer','$rootScope','Semver',
      function controller(_,$scope, $log, $state,_consumer, $rootScope, Semver) {


          $scope.consumer = _consumer.data
          $scope.activeSection = 0;
          $scope.sections = [
              {
                  name : 'Details',
                  icon : 'mdi-information-outline'
              },
              {
                  name : 'ACL Groups',
                  icon : 'mdi-account-multiple-outline'
              },
              {
                  name : 'Credentials',
                  icon : 'mdi-security'
              },
          ]

          if(Semver.cmp($rootScope.Gateway.version,"0.11.0") >=0) {
              $scope.sections.push({
                  name : 'Plugins',
                  icon : 'mdi-power-plug'
              });
          }

          $scope.showPluginsSection = Semver.cmp($rootScope.Gateway.version,"0.11.0") >=0;

          $scope.showSection = function(index) {
              $scope.activeSection = index;
          }


          $scope.$on('user.node.updated',function(node){
              $state.go('consumers');
          });

      }
    ])
}());
