/**
 * This file contains all necessary Angular controller definitions for 'frontend.admin.login-history' module.
 *
 * Note that this file should only contain controllers and nothing else.
 */
(function() {
  'use strict';

  angular.module('frontend.consumers')
    .controller('ConsumerController', [
      '_','$scope', '$log', '$state','_consumer',
      function controller(_,$scope, $log, $state,_consumer) {

          $scope.consumer = _consumer.data
          $scope.activeSection = 0;
          $scope.sections = [
              {
                  name : 'Details',
                  icon : '&#xE88F;'
              },
              {
                  name : 'ACL Groups',
                  icon : '&#xE7FC'
              },
              {
                  name : 'Credentials',
                  icon : '&#xE899;'
              },
          ]

          $scope.showSection = function(index) {
              $scope.activeSection = index
          }


          $scope.$on('kong.node.updated',function(node){
              $state.go('consumers')
          })

      }
    ])
}());
