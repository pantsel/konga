/**
 * This file contains all necessary Angular controller definitions for 'frontend.login-history' module.
 *
 * Note that this file should only contain controllers and nothing else.
 */
(function() {
  'use strict';

  angular.module('frontend.apis')
    .controller('ApiController', [
      '$scope','$state','_api',
      function controller($scope,$state,_api) {

          $scope.api = _api.data
          $state.current.data.pageName = "Edit API : " + ( $scope.api.name || $scope.api.id )
          $scope.activeSection = 0;
          $scope.sections = [
              {
                  name : 'API Details',
                  icon : '&#xE88F;'
              },
              {
                  name : 'Assigned plugins',
                  icon : '&#xE8C1;'
              },
              {
                  name : 'SSL',
                  icon : '&#xE32A;'
              }
          ]

          $scope.showSection = function(index) {
              $scope.activeSection = index
          }

      }
    ])
  ;
}());
