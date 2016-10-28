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

              DialogService.prompt(
                  "Delete Consumer","Really want to delete the selected consumer?",
                  ['No don\'t','Yes! delete it'],
                  function accept(){
                      ConsumerService.delete(consumer)
                          .then(function(res){
                              $scope.consumers.data.splice($scope.consumers.data.indexOf(consumer),1);
                          }).catch(function(err){

                      })
                  },function decline(){})

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

          function importConsumersold() {
              $uibModal.open({
                  animation: true,
                  ariaLabelledBy: 'modal-title',
                  ariaDescribedBy: 'modal-body',
                  templateUrl: '/frontend/admin/consumers/import-consumer-modal.html',
                  controller: function($scope,$rootScope,$log,$uibModalInstance,
                                       MessageService,ConsumerService,RemoteStorageService){

                      $scope.close = close
                      $scope.back = back
                      $scope.adapters = {
                          'mysql' : {
                              name : 'MySQL',
                              value : 'mysql',
                              description : 'Import Consumers from a MySQL database table',
                              form_fields : {
                                  host : {
                                      name : 'host',
                                      type : 'text',
                                      description : 'The database host. Defaults to localhost'
                                  },
                                  user : {
                                      name : 'user',
                                      type : 'text',
                                      description : 'The database user. Defaults to root'
                                  },
                                  password : {
                                      name : 'password',
                                      type : 'text',
                                      description : 'The database user\'s password.'
                                  },
                                  database : {
                                      name : 'database',
                                      type : 'text',
                                      required : true,
                                      description : 'The database to connect to.'
                                  },
                                  table : {
                                      name : 'table',
                                      type : 'text',
                                      required : true,
                                      description : 'The table containing the consumers that will be imported to Kong.'
                                  }
                              }
                          },
                          "sql" : {
                              name : 'SQL',
                              value : 'sql',
                              description : 'Import Consumers from an SQL database table'
                          },
                          "mongodb" : {
                              name : 'MongoDB',
                              value : 'mongodb',
                              description : 'Import Consumers from an MongoDB collection'
                          }
                      }
                      $scope.activeStep = 0

                      $scope.steps = [
                          {
                              heading : 'Select Storage',
                              description : 'Select a storage from which to import the consumers',
                              active : true,
                          },
                          {
                              heading : 'Connection options',
                              description : 'Define connection options to the remote storage.',
                              active : false,
                          },
                          {
                              heading : 'Define Consumer fields',
                              description : 'Define Consumers <code>username</code> and <code>custom_id</code> fields.',
                              active : false,
                          },
                          {
                              heading : 'Import consumers',
                              description : 'Select the consumers to import.',
                              active : false,
                          }
                      ]

                      $scope.configuration = {
                          adapter : '',
                          consumer_fields : {
                              username : '',
                              custom_id : ''
                          }
                      }



                      function next() {
                          $scope.activeStep = $scope.steps.length > $scope.activeStep ? $scope.activeStep + 1 : $scope.activeStep
                      }

                      function back() {
                          $scope.activeStep = $scope.activeStep > 0 ? $scope.activeStep - 1 : 0
                      }

                      $scope.selectAdapter = function(adapter) {
                          $scope.configuration.adapter = adapter
                          $log.debug("Adapter selected: ",$scope.configuration.adapter )
                          next()
                      }

                      $scope.testConnection = function() {

                          var connOptions = {}
                          $scope.busy = true;
                          angular
                              .forEach($scope.adapters[$scope.configuration.adapter].form_fields,
                                  function(value,key){
                                      connOptions[key] = value.value
                              })

                          RemoteStorageService
                              .testConnection(connOptions)
                              .then(function(resp){
                                  $log.debug("Test connection", resp)
                                  $scope.busy = false;
                                  next()
                              }).catch(function(err){
                                $log.error("Test connection", err)
                                $scope.busy = false;
                                MessageService.error("Could not connect to the remote storage with the provided configuration")
                          })
                      }


                      $scope.fetchConsumers = function() {

                          var connOptions = {}
                          $scope.busy = true;
                          angular
                              .forEach($scope.adapters[$scope.configuration.adapter].form_fields,
                                  function(value,key){
                                      connOptions[key] = value.value
                                  })

                          connOptions.fields = $scope.configuration.consumer_fields
                              //$scope.configuration.consumer_fields.username + ',' + $scope.configuration.consumer_fields.custom_id

                          console.log("connOptions",connOptions)
                          RemoteStorageService
                              .fetchConsumers(connOptions)
                              .then(function(resp){
                                  $log.debug("Fetch Consumers", resp)
                                  $scope.busy = false;
                                  $scope.remote_consumers = resp.data
                                  next()
                              }).catch(function(err){
                              $log.error("Fetch Consumers", err)
                              $scope.busy = false;
                              MessageService.error("Could not retrieve consumers from the remote storage")
                          })
                      }


                      function close() {
                          $uibModalInstance.dismiss()
                      }
                  },
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
