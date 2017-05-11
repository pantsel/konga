/**
 * This file contains all necessary Angular controller definitions for 'frontend.login-history' module.
 *
 * Note that this file should only contain controllers and nothing else.
 */
(function() {
  'use strict';

  angular.module('frontend.apis')
    .controller('ApiSSLController', [
      '$scope', '$rootScope','$log', '$state','ApiService','$uibModal','DialogService',
        'MessageService','SettingsService','$http','Upload','Semver',
      function controller($scope, $rootScope, $log, $state, ApiService, $uibModal,DialogService,
                          MessageService,SettingsService,$http,Upload, Semver) {


          $scope.openUploadCertsModal = function() {
              var modalInstance = $uibModal.open({
                  animation: true,
                  ariaLabelledBy: 'modal-title',
                  ariaDescribedBy: 'modal-body',
                  templateUrl: 'js/app/apis/add-api-certificates-modal.html',
                  controller: function($scope,$uibModalInstance,_api){

                      $scope.api = _api
                      $scope.data = {}
                      $scope.close = function() {
                          return $uibModalInstance.dismiss()
                      }


                      $scope.submitCerts = function() {


                          $scope.uploading = true;
                          var files = [$scope.data.cert,$scope.data.key];


                          Upload.upload({
                              url: 'kong/certificates',
                              arrayKey: '',
                              data: {
                                  file: files,
                                  snis : $scope.data.snis
                              }
                          }).then(function (resp) {
                              console.log('Success ' + resp.config.data.file.name + 'uploaded. Response: ' + resp.data);
                              $scope.uploading = false;
                              $uibModalInstance.dismiss({
                                  data : resp
                              })
                          }, function (err) {
                              console.error('Error',err);
                              $scope.uploading = false;
                              handleErrors(err)


                          }, function (evt) {
                              var progressPercentage = parseInt(100.0 * evt.loaded / evt.total);
                              console.log('progress: ' + progressPercentage + '% ' + evt.config.data.file.name);
                          });
                      }

                      modalInstance.result.then(function () {

                      }, function (data) {
                          if(data && data.data) _fetchCertificates()
                      });

                      function handleErrors(err) {
                          $scope.errors = {}
                          if(err.data && err.data.customMessage){

                              for(var key in err.data.customMessage){
                                  $scope.errors[key] = err.data.customMessage[key]
                              }
                          }

                          console.log("SCOPE ERRORS",$scope.errors)
                      }

                  },
                  controllerAs: '$ctrl',
                  resolve : {
                      _api : function() {
                          return $scope.api
                      }
                  }
                  //size: 'lg',
              });
          }

          $scope.deleteItem = function(item) {
              DialogService.prompt(
                  "Delete Certificate","Really want to delete the selected certificate?",
                  ['No don\'t','Yes! delete it'],
                  function accept(){
                      doDeleteItem(item)
                  },function decline(){})
          }


          function doDeleteItem(item) {
              $http.delete('api/certificates/' + item.id)
                  .then(function(resp){
                      _fetchCertificates()
                  }).catch(function(err){
                  // ToDo
              })
          }







          function _fetchCertificates() {
              $scope.loading = true;
              $http.get('api/certificates')
                  .then(function(res){
                    $log.debug("Fetch API certificates",res)
                      $scope.certificates = Semver.cmp($rootScope.Gateway.version,"0.10.0") > 0 ? res.data.data : res.data
                      console.log("$scope.certificates",$scope.certificates)
                      $scope.loading = false;
                  }).catch(function(err){
                    $log.error("Fetch API certificates error",err)
                    $scope.loading = false;
              })
          }

          _fetchCertificates()

      }
    ])
  ;
}());
