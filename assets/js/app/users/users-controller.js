/**
 * This file contains all necessary Angular controller definitions for 'frontend.admin.login-history' module.
 *
 * Note that this file should only contain controllers and nothing else.
 */
(function() {
  'use strict';

  angular.module('frontend.users')
    .controller('UsersController', [
      '_','$scope', '$q','$log', 'SocketHelperService', 'MessageService',
        'UserService','$state','ApiService','$uibModal',
        'DialogService','UserModel','ListConfig','_items','_count',
      function controller(_,$scope, $q,$log,SocketHelperService, MessageService,
                          UserService, $state, ApiService, $uibModal,
                          DialogService,UserModel,ListConfig, _items, _count ) {


          UserModel.setScope($scope, false, 'items', 'itemCount');

          // Add default list configuration variable to current scope
          $scope = angular.extend($scope, angular.copy(ListConfig.getConfig('user',UserModel)));

          // Set initial data
          $scope.items = _items;
          $scope.itemCount = _count.count;
          $scope.user = UserService.user();


          $log.debug("_items",_items)
          $log.debug("_count",_count)
          $log.debug("titleItems",$scope.titleItems)



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


          /**
           * Simple watcher for 'itemsPerPage' scope variable. If this is changed we need to fetch author data
           * from server.
           */
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

          $scope.deleteUser = deleteUser



          function deleteUser($index,user) {
              DialogService.confirm(
                  "Delete User","Really want to delete the user?",
                  ['No don\'t','Yes! delete it'],
                  function accept(){
                      UserModel.delete(user.id)
                          .then(function(resp){
                              $scope.items.splice($scope.items.indexOf(user),1);
                          }).catch(err => {
                        console.error(err);
                        MessageService.error(_.get(err, 'data.message', 'Failed to delete user'));
                      })
                  },function decline(){})
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
              var count = UserModel
                  .count(commonParameters)
                  .then(
                      function onSuccess(response) {
                          $scope.itemCount = response.count;
                      }
                  )
                  ;

              console.log("parameters",parameters)

              // Fetch actual data
              var load = UserModel
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



          $scope.$on('konga.user.created',function(ev,user){
              _triggerFetchData()
          })


          $scope.$on('konga.user.updated',function(ev,user){
              _triggerFetchData()
          })
      }
    ])
  ;
}());
