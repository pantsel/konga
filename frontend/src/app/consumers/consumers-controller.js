/**
 * This file contains all necessary Angular controller definitions for 'frontend.admin.login-history' module.
 *
 * Note that this file should only contain controllers and nothing else.
 */
(function() {
  'use strict';

  angular.module('frontend.consumers')
    .controller('ConsumersController', [
      '_','$scope', '$log', '$state','ConsumerService','$q','MessageService',
        'RemoteStorageService','UserService','SocketHelperService',
        '$uibModal','DialogService','ConsumerModel','ListConfig','_items','_count',
      function controller(_,$scope, $log, $state, ConsumerService,$q,MessageService,
                          RemoteStorageService,UserService,SocketHelperService,
                          $uibModal,DialogService,ConsumerModel,ListConfig,_items,_count ) {

          ConsumerModel.setScope($scope, false, 'items', 'itemCount');

          // Add default list configuration variable to current scope
          $scope = angular.extend($scope, angular.copy(ListConfig.getConfig()));

          // Set initial data
          $scope.items = _items;
          $scope.itemCount = _count.count;
          $scope.user = UserService.user();
          $scope.importConsumers = importConsumers
          $scope.openCreateConsumerModal = openCreateConsumerModal
          $scope.deleteConsumer = deleteConsumer
          $scope.deleteChecked = deleteChecked
          $scope.massAssignCredentials = massAssignCredentials
          $scope.syncConsumers = syncConsumers
          $scope.globalCheck = {
              isAllChecked : false
          };

          // Initialize used title items
          $scope.titleItems = ListConfig.getTitleItems(ConsumerModel.endpoint);

          $log.debug("items",$scope.items)
          //$log.debug("_count",_count)
          //$log.debug("titleItems",$scope.titleItems)


          // Initialize default sort data
          $scope.paging = {
              currentPage: 1,

          };

          $scope.sort = {
              column: 'createdAt',
              direction: false
          };

          // Initialize filters
          $scope.filters = {
              searchWord: '',
              columns: $scope.titleItems
          };

          // Function to change sort column / direction on list
          $scope.changeSort = function changeSort(item) {
              var sort = $scope.sort;

              if (sort.column === item.column) {
                  sort.direction = !sort.direction;
              } else {
                  sort.column = item.column;
                  sort.direction = true;
              }

              _triggerFetchData();
          };


          $scope.pageChanged = function() {
              $log.log('Page changed to: ' + $scope.paging.currentPage);
              _fetchData();
          }

          $scope.$watch('itemsPerPage', function watcher(valueNew, valueOld) {
              if (valueNew !== valueOld) {
                  _triggerFetchData();
              }
          });


          $scope.$watch('filters', function watcher(valueNew, valueOld) {
              if (valueNew !== valueOld) {
                  _triggerFetchData();
              }
          },true);


          $scope.$watch('globalCheck.isAllChecked', function watcher(valueNew, valueOld) {
              if (valueNew !== valueOld) {
                  checkConsumers(valueNew)
              }
          });

          function checkConsumers(checked) {
              $scope.items.forEach(function(consumer){
                  consumer.checked = checked
              })
          }

          function massAssignCredentials() {

              var consumers = []
              $scope.items.forEach(function(consumer){
                  if(consumer.checked) consumers.push(consumer)
              })

              if(!consumers.length) {
                  MessageService.error('You have not selected any consumers')
                  return false
              }


              $uibModal.open({
                  animation: true,
                  ariaLabelledBy: 'modal-title',
                  ariaDescribedBy: 'modal-body',
                  templateUrl: '/frontend/consumers/credentials/mass-assign-modal.html',
                  controller: function($log,$scope,$uibModalInstance,ConsumerService,MessageService,_consumers){

                      $scope.consumers = _consumers
                      $scope.close = function() {
                          $uibModalInstance.dismiss()
                      }

                      $scope.credentials = [
                          {
                              name : "Key Auth",
                              description : "Generate an API key for each consumer.",
                              value : "key-auth"
                          },
                          {
                              name : "JWT",
                              description : "Generate JWT credentials for each consumer." +
                              " The default values will be used for all of JWT configuration properties" +
                              " as specified in <a href='https://getkong.org/plugins/jwt/'>Kong's documentation</a>.",
                              value : "jwt"
                          },
                          {
                              name : "HMAC Auth",
                              description : "Generate HMAC credentials for each consumer." +
                              "The consumer's username will be used as the username property " +
                              "and a secret will be auto-generated for each credential.",
                              value : "hmac-auth"
                          }
                      ]


                      $scope.onCredentialSelected = function(credential) {
                          DialogService.prompt(
                              "Mass Assign Credentials",
                              "You are about to mass assign <strong>" + credential + "</strong> credentials" +
                              " to " + consumers.length + " selected consumers.<br>Continue?",
                              ['No don\'t','Yes, do it!'],
                              function accept(){
                                  $scope.busy = true

                                  var promises = []

                                  switch(credential) {
                                      case "hmac-auth":
                                          _consumers.forEach(function(consumer){
                                              promises.push(ConsumerService.createHMACAuthCredentials(consumer.id,{
                                                  username : consumer.username,
                                                  secret   : Math.random().toString(36).slice(-8)
                                              }))
                                          })
                                          break;
                                      case "key-auth":
                                          _consumers.forEach(function(consumer){
                                              promises.push(ConsumerService.createApiKey(consumer.id))
                                          })
                                          break;
                                      case "jwt":
                                          _consumers.forEach(function(consumer){
                                              promises.push(ConsumerService.createJWT(consumer.id))
                                          })
                                          break;
                                  }



                                  $q
                                      .all(promises)
                                      .finally(
                                          function onFinally() {
                                              $scope.busy = false;
                                              MessageService.success('Credentials where assigned successfully!')
                                          }
                                      )
                                  ;

                              },function decline(){})
                      }
                  },
                  controllerAs: '$ctrl',
                  resolve : {
                      _consumers : function() {
                          return consumers;
                      }
                  }
              });



          }

          function deleteChecked() {

              var consumers = []
              $scope.items.forEach(function(consumer){
                  if(consumer.checked) consumers.push(consumer)
              })

              if(!consumers.length) {
                  MessageService.error('You have not selected any consumers to delete')
                  return false
              }

              DialogService.prompt(
                  "Delete Consumers","Really want to delete the selected consumers?",
                  ['No don\'t','Yes! delete them'],
                  function accept(){
                      deleteConsumers(consumers)
                  },function decline(){})

          }

          function syncConsumers() {
              DialogService.prompt(
                  "Sync Consumers","<strong>This action will sync Kong's consumers with Konga.</strong><br>" +
                  "Kong's consumers that don't exists in Konga's database will be imported" +
                  " while Konga's consumers that don't exist in Kong's database will be removed." +
                  "<br><br>Continue?",
                  ['No don\'t','Yes, do it!'],
                  function accept(){
                      $scope.syncing = true
                      ConsumerService.sync()
                          .then(function(res){
                              $scope.syncing = false
                              MessageService.success("Consumers synced successfully!")
                              _triggerFetchData()
                          }).catch(function(err){
                          $scope.syncing = false
                      })
                  },function decline(){})
          }

          function deleteConsumers(consumers) {

              $scope.deleting = true;
              var promises = []
              consumers.forEach(function(consumer){
                  promises.push(ConsumerService.delete(consumer))
              })

              $q
                  .all(promises)
                  .finally(
                      function onFinally() {
                          $scope.deleting = false;
                          _triggerFetchData()
                      }
                  )
              ;
          }


          function deleteConsumer(consumer) {
              DialogService.prompt(
                  "Delete Consumer","Really want to delete the selected consumer?",
                  ['No don\'t','Yes! delete it'],
                  function accept(){
                      ConsumerService.delete(consumer)
                          .then(function(res){
                              $scope.items.splice($scope.items.indexOf(consumer),1);
                          }).catch(function(err){

                      })
                  },function decline(){})
          }



          function importConsumers() {
              $uibModal.open({
                  animation: true,
                  ariaLabelledBy: 'modal-title',
                  ariaDescribedBy: 'modal-body',
                  templateUrl: '/frontend/consumers/import/modal-select-storage.html',
                  controller: 'ImportConsumersStorageController',
                  controllerAs: '$ctrl',
                  resolve : {
                      _adapters : function() {
                          return RemoteStorageService.loadAdapters();
                      }
                  }
              });
          }

          function openCreateConsumerModal() {
              $uibModal.open({
                  animation: true,
                  ariaLabelledBy: 'modal-title',
                  ariaDescribedBy: 'modal-body',
                  templateUrl: '/frontend/consumers/create-consumer-modal.html',
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



          function _triggerFetchData() {
              if ($scope.paging.currentPage === 1) {
                  _fetchData();
              } else {
                  $scope.paging.currentPage = 1;
              }
          }


          /**
           * Helper function to fetch actual data for GUI from backend server with current parameters:
           *  1) Current page
           *  2) Search word
           *  3) Sort order
           *  4) Items per page
           *
           * Actually this function is doing two request to backend:
           *  1) Data count by given filter parameters
           *  2) Actual data fetch for current page with filter parameters
           *
           * These are fetched via 'AuthorModel' service with promises.
           *
           * @private
           */
          function _fetchData() {
              $scope.loading = true;

              // Common parameters for count and data query
              var commonParameters = {
                  where: SocketHelperService.getWhere($scope.filters)
              };

              // Data query specified parameters
              var parameters = {
                  limit: $scope.itemsPerPage,
                  skip: ($scope.paging.currentPage - 1) * $scope.itemsPerPage,
                  sort: $scope.sort.column + ' ' + ($scope.sort.direction ? 'ASC' : 'DESC')
              };

              // Fetch data count
              var count = ConsumerModel
                  .count(commonParameters)
                  .then(
                      function onSuccess(response) {
                          $scope.itemCount = response.count;
                      }
                  )
                  ;

              $log.debug("parameters",parameters)

              // Fetch actual data
              var load = ConsumerModel
                  .load(_.merge({}, commonParameters, parameters))
                  .then(
                      function onSuccess(response) {
                          $scope.items = response;
                      }
                  )
                  ;

              // And wrap those all to promise loading
              $q
                  .all([count, load])
                  .finally(
                      function onFinally() {
                          $scope.loaded = true;
                          $scope.loading = false;
                      }
                  )
              ;
          }



          $scope.$on('consumer.created',function(ev,user){
              _triggerFetchData()
          })


          $scope.$on('consumer.updated',function(ev,user){
              _triggerFetchData()
          })

      }
    ])
}());
