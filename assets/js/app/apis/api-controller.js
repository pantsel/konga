/**
 * This file contains all necessary Angular controller definitions for 'frontend.login-history' module.
 *
 * Note that this file should only contain controllers and nothing else.
 */
(function() {
  'use strict';

  angular.module('frontend.apis')
    .controller('ApiController', [
      '$scope','$rootScope','$state','SettingsService','$log','_api',
      function controller($scope,$rootScope,$state,SettingsService,$log,_api) {

          $scope.api = _api.data

          // Fix empty object properties
          fixProperties()

          $log.debug("API",$scope.api)
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
              }
          ]



          $rootScope.$watch('$node',function(newval) {
              if(newval && newval.kong_version == '0-10-x') {
                  $scope.sections.push({
                      name : 'SSL',
                      icon : '&#xE32A;'
                  })
              }
          })



          $scope.showSection = function(index) {
              $scope.activeSection = index
          }

          function fixProperties() {
              var problematicProperties = ['uris','hosts','methods']
              problematicProperties.forEach(function(property){
                  if($scope.api[property] && isObject($scope.api[property]) && !Object.keys($scope.api[property]).length){
                      $scope.api[property] = ""
                  }
              })
          }

          function isObject(obj) {
              return obj === Object(obj);
          }

      }
    ])
  ;
}());
