/**
 * This file contains all necessary Angular controller definitions for 'frontend.admin.login-history' module.
 *
 * Note that this file should only contain controllers and nothing else.
 */
(function() {
  'use strict';

  angular.module('frontend.admin.consumers')
    .controller('ConsumersController', [
      '_','$scope', '$log', '$state','ConsumerService','$uibModal','DialogService','_consumers',
      function controller(_,$scope, $log, $state, ConsumerService, $uibModal,DialogService,_consumers ) {

          $scope.consumers = _consumers.data
          $log.debug("consumers",$scope.consumers)

          $scope.query = {}
          $scope.search = {
              value : ''
          }
          $scope.openCreateConsumerModal = openCreateConsumerModal
          $scope.openEditConsumerModal = openEditConsumerModal
          $scope.importConsumers = importConsumers
          $scope.deleteConsumer = deleteConsumer


          function deleteConsumer(consumer) {

              ConsumerService.delete(consumer)
                  .then(function(res){
                      $scope.consumers.data.splice($scope.consumers.data.indexOf(consumer),1);
                  }).catch(function(err){

              })

              //DialogService.prompt(
              //    "Delete Consumer","Really want to delete the selected consumer?",
              //    ['No don\'t','Yes! delete it'],
              //    function accept(){
              //        ConsumerService.delete(consumer)
              //            .then(function(res){
              //                $scope.consumers.data.splice($scope.consumers.data.indexOf(consumer),1);
              //            }).catch(function(err){
              //
              //        })
              //    },function decline(){})

          }


          function openEditConsumerModal(consumer) {
              var modalInstance = $uibModal.open({
                  animation: true,
                  ariaLabelledBy: 'modal-title',
                  ariaDescribedBy: 'modal-body',
                  templateUrl: '/frontend/admin/consumers/edit-consumer-modal.html',
                  controller: function($scope,$rootScope,$log,$uibModalInstance,MessageService,ConsumerService,_consumer){

                      $scope.consumer = _consumer

                      $scope.close = close
                      $scope.submit = submit

                      function submit(){
                          ConsumerService.update($scope.consumer.id,{
                              username : $scope.consumer.username,
                              custom_id : $scope.consumer.custom_id
                          })
                              .then(function(res){
                                  $log.debug(res.data)
                                  MessageService.success("Consumer updated successfully!")
                                  $rootScope.$broadcast('consumer.updated',res.data)
                                  close()
                              }).catch(function(err){
                              $log.error("Failed to create consumer", err)
                              $scope.errors = err.data.customMessage || {}
                          })
                      }

                      function close() {
                          $uibModalInstance.dismiss()
                      }
                  },
                  controllerAs: '$ctrl',
                  resolve : {
                      _consumer : function() {
                          return _.cloneDeep(consumer);
                      }
                  }
              });

              modalInstance.result.then(function (selectedItem) {

              }, function () {

              });
          }

          function openCreateConsumerModal() {
              var modalInstance = $uibModal.open({
                  animation: true,
                  ariaLabelledBy: 'modal-title',
                  ariaDescribedBy: 'modal-body',
                  templateUrl: '/frontend/admin/consumers/create-consumer-modal.html',
                  controller: function($scope,$rootScope,$log,$uibModalInstance,MessageService,ConsumerService){

                      $scope.consumer = {
                          username  : '',
                          custom_id : ''
                      }

                      $scope.close = close
                      $scope.submit = submit

                      function submit(){
                          ConsumerService.create($scope.consumer)
                              .then(function(res){
                                  MessageService.success("Consumer created successfully!")
                                  $rootScope.$broadcast('consumer.created',res.data)
                                  close()
                              }).catch(function(err){
                                $log.error("Failed to create consumer", err)
                                $scope.errors = err.data.customMessage || {}
                          })
                      }

                      function close() {
                          $uibModalInstance.dismiss()
                      }
                  },
                  controllerAs: '$ctrl',
              });
          }


          function importConsumers() {
              $uibModal.open({
                  animation: true,
                  ariaLabelledBy: 'modal-title',
                  ariaDescribedBy: 'modal-body',
                  templateUrl: '/frontend/admin/consumers/import/modal-select-storage.html',
                  controller: 'ImportConsumersStorageController',
                  controllerAs: '$ctrl',
              });
          }


          function queryConsumers(){
              ConsumerService.query($scope.query)
                  .then(function(res){
                      $scope.consumers = res.data
                  })
                  .catch(function(err){
                      $log.error("Error querying consumers",err)
                  })
          }

          $scope.$on('consumer.created',function(ev,consumer){
              queryConsumers()
          })

          $scope.$on('consumer.updated',function(ev,consumer){
              queryConsumers()
          })

      }
    ])
}());
