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
        '$uibModal','DialogService','ConsumerModel','ListConfig',
      function controller(_,$scope, $log, $state, ConsumerService,$q,MessageService,
                          RemoteStorageService,UserService,SocketHelperService,
                          $uibModal,DialogService,ConsumerModel,ListConfig ) {

          ConsumerModel.setScope($scope, false, 'items', 'itemCount');

          // Add default list configuration variable to current scope
          $scope = angular.extend($scope, angular.copy(ListConfig.getConfig()));

          // Set initial data
          $scope.loading = false;
          $scope.items = [] // Init items
          $scope.user = UserService.user();
          $scope.importConsumers = importConsumers
          $scope.openCreateConsumerModal = openCreateConsumerModal
          $scope.deleteConsumer = deleteConsumer
          $scope.deleteChecked = deleteChecked
          //$scope.massAssignCredentials = massAssignCredentials
          //$scope.syncConsumers = syncConsumers
          $scope.globalCheck = {
              isAllChecked : false
          };

          // Initialize used title items
          $scope.titleItems = ListConfig.getTitleItems('consumer');

          $log.debug("items",$scope.items)
          //$log.debug("_count",_count)
          //$log.debug("titleItems",$scope.titleItems)


          // Initialize default sort data
          $scope.paging = {
              currentPage: 1,

          };

          $scope.sort = {
              column: 'created_at',
              direction: true
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

              //_triggerFetchData();
          };


          //$scope.pageChanged = function() {
          //    $log.log('Page changed to: ' + $scope.paging.currentPage);
          //    _fetchData();
          //}

          //function getParameterByName(name, url) {
          //    if (!url) {
          //        url = window.location.href;
          //    }
          //    name = name.replace(/[\[\]]/g, "\\$&");
          //    var regex = new RegExp("[?&]" + name + "(=([^&#]*)|&|#|$)"),
          //        results = regex.exec(url);
          //    if (!results) return null;
          //    if (!results[2]) return '';
          //    return decodeURIComponent(results[2].replace(/\+/g, " "));
          //}

          $scope.loadMore = function() {
              if(!$scope.next) return false;
              $log.debug("Must load More!!!")
              $scope.paging.offset = $scope.offset
              _fetchData();
          }


          //$scope.$watch('paging.currentPage', function watcher(valueNew, valueOld) {
          //
          //    $log.log('Page changed from : ' + valueOld +  ' to: ' + valueNew);
          //    if (valueNew !== valueOld) {
          //
          //        if(valueNew > valueOld) {
          //            $scope.paging.offset = $scope.offset
          //        }
          //
          //        if(valueNew < valueOld) {
          //            $scope.paging.offset = $scope.offset
          //        }
          //        _triggerFetchData();
          //
          //    }
          //});



          //$scope.$watch('itemsPerPage', function watcher(valueNew, valueOld) {
          //    if (valueNew !== valueOld) {
          //        _triggerFetchData(true);
          //    }
          //});


          //$scope.$watch('filters', function watcher(valueNew, valueOld) {
          //    if (valueNew !== valueOld) {
          //        _triggerFetchData();
          //    }
          //},true);


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

          //function massAssignCredentials() {
          //
          //    var consumers = []
          //    $scope.items.forEach(function(consumer){
          //        if(consumer.checked) consumers.push(consumer)
          //    })
          //
          //    if(!consumers.length) {
          //        MessageService.error('You have not selected any consumers')
          //        return false
          //    }
          //
          //
          //    $uibModal.open({
          //        animation: true,
          //        ariaLabelledBy: 'modal-title',
          //        ariaDescribedBy: 'modal-body',
          //        templateUrl: 'js/app/consumers/credentials/mass-assign-modal.html',
          //        controller: 'MassAssignCredentialsController',
          //        controllerAs: '$ctrl',
          //        resolve : {
          //            _consumers : function() {
          //                return consumers;
          //            }
          //        }
          //    });
          //
          //
          //
          //}

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

          //function syncConsumers() {
          //    DialogService.prompt(
          //        "Sync Consumers","<strong>This action will sync Kong's consumers with Konga.</strong><br>" +
          //        "Kong's consumers that don't exists in Konga's database will be imported" +
          //        " while Konga's consumers that don't exist in Kong's database will be removed." +
          //        "<br><br>Continue?",
          //        ['No don\'t','Yes, do it!'],
          //        function accept(){
          //            $scope.syncing = true
          //            ConsumerService.sync()
          //                .then(function(res){
          //                    $scope.syncing = false
          //                    MessageService.success("Consumers synced successfully!")
          //                    _triggerFetchData()
          //                }).catch(function(err){
          //                $scope.syncing = false
          //            })
          //        },function decline(){})
          //}

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
                          _triggerFetchData(true)
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
                  templateUrl: 'js/app/consumers/import/modal-select-storage.html',
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
                  templateUrl: 'js/app/consumers/create-consumer-modal.html',
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
              _fetchData();
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

              if($scope.loading) return false;
              $scope.loading = true;

              // Common parameters for count and data query
              var commonParameters = {
                  //where: SocketHelperService.getWhere($scope.filters)
              };

              // Data query specified parameters
              var parameters = {
                  size: $scope.itemsPerPage,
                  offset: $scope.paging.offset || 0
              };

              if($scope.filters.searchWord) parameters.username = $scope.filters.searchWord

              // Fetch data count
              $log.debug("parameters",parameters)

              // Fetch actual data
              ConsumerService
                  .query(_.merge({}, commonParameters, parameters))
                  .then(
                      function onSuccess(response) {

                          $log.debug("ConsumerService",response)
                          $scope.loading = false;
                          $scope.items = response.data.data
                          $scope.itemCount = response.data.total;
                          $scope.next = response.data.next;
                          $scope.offset = response.data.offset;
                      }
                  );
          }



          $scope.$on('consumer.created',function(ev,user){
              $scope.items.push(user)
          })


          $scope.$on('consumer.updated',function(ev,user){
              _fetchData()
          })

          $scope.$on('credentials.assigned',function(ev,user){
              _fetchData()
          })

          $scope.$on('search',function(ev,user){
              _fetchData()
          })

          _fetchData()

      }
    ])
}());
