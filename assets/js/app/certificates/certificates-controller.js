/**
 * This file contains all necessary Angular controller definitions for 'frontend.admin.login-history' module.
 *
 * Note that this file should only contain controllers and nothing else.
 */
(function() {
  'use strict';

  angular.module('frontend.certificates')
    .controller('CertificatesController',  [
        '$scope', '$rootScope','$log', '$state','ApiService','$uibModal','DialogService','UserService',
        'MessageService','SettingsService','$http','Upload','Semver','$timeout','CertificateModel','ListConfig',
        function controller($scope, $rootScope, $log, $state, ApiService, $uibModal,DialogService,UserService,
                            MessageService,SettingsService,$http,Upload, Semver, $timeout, CertificateModel,ListConfig) {


            CertificateModel.setScope($scope, false, 'items', 'itemCount');
            $scope = angular.extend($scope, angular.copy(ListConfig.getConfig('certificate',CertificateModel)));
            $scope.user = UserService.user();


            $scope.openUploadCertsModal = function(certificate) {
                var modalInstance = $uibModal.open({
                    animation: true,
                    ariaLabelledBy: 'modal-title',
                    ariaDescribedBy: 'modal-body',
                    templateUrl: 'js/app/certificates/add-certificates-modal.html',
                    controller: function($scope,$uibModalInstance,_certificate){
                        $scope.update = _certificate
                        $scope.data = _certificate || {}
                        $scope.close = function() {
                            return $uibModalInstance.dismiss()
                        }


                        $scope.submitCerts = function() {


                            $scope.uploading = true;
                            $scope.errorMessage = ""
                            var files = [$scope.data.cert,$scope.data.key];


                            Upload.upload({
                                url: 'kong/certificates' + ( $scope.data.id ? '/' + $scope.data.id : "" ),
                                arrayKey: '',
                                method : $scope.data.id ? 'PATCH' : 'POST',
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
                            if(data && data.data) _fetchData()
                        });

                        function handleErrors(err) {
                            $scope.errors = {}

                            if(err.data) {
                                if(err.data.customMessage){

                                    for(var key in err.data.customMessage){
                                        $scope.errors[key] = err.data.customMessage[key]
                                    }
                                }

                                if(err.data.message) {
                                    $scope.errorMessage = err.data.message
                                }
                            }else{
                                $scope.errorMessage = "An unknown error has occured"
                            }



                            //console.log("SCOPE ERRORS",$scope.errors)
                        }

                    },
                    controllerAs: '$ctrl',
                    resolve : {
                        _certificate : function() {
                            return certificate
                        }
                    }
                    //size: 'lg',
                });
            }




            function _fetchData() {
                $scope.loading = true;
                CertificateModel.load({
                    size : $scope.itemsFetchSize
                }).then(function(response){
                    console.log(response)
                    $scope.items = response;
                    $scope.loading= false;

                    if(response.data && Object.keys(response.data).length) {
                        $scope.certificates = Semver.cmp($rootScope.Gateway.version,"0.10.1") > 0 ? response.data.data : response.data
                    }else{
                        $scope.certificates = []
                    }
                })
            }

            _fetchData()



            $scope.$on('user.node.updated',function(node){
                $timeout(function(){
                    _fetchData()
                })

            })

        }
    ])
  ;
}());
