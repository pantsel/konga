/**
 * This file contains all necessary Angular controller definitions for 'frontend.admin.login-history' module.
 *
 * Note that this file should only contain controllers and nothing else.
 */
(function () {
  'use strict';

  angular.module('frontend.connections')
    .controller('ConnectionsController', [
      '_', '$scope', '$rootScope', '$q', '$log', '$ngBootbox', 'UserModel', '$http',
      'SocketHelperService', 'AuthService', 'UserService', 'SettingsService', 'MessageService',
      '$state', '$uibModal', 'DialogService', 'NodeModel', '$localStorage', 'InfoService',
      'ListConfig',
      function controller(_, $scope, $rootScope, $q, $log, $ngBootbox, UserModel, $http,
                          SocketHelperService, AuthService, UserService, SettingsService, MessageService,
                          $state, $uibModal, DialogService, NodeModel, $localStorage, InfoService,
                          ListConfig) {


        NodeModel.setScope($scope, false, 'items', 'itemCount');

        // Add default list configuration variable to current scope
        $scope = angular.extend($scope, angular.copy(ListConfig.getConfig()));

        // Set initial data
        $scope.createNode = createNode;
        $scope.isActive = isActive;
        $scope.editNode = editNode;
        $scope.user = UserService.user();
        $scope.kong_versions = SettingsService.getKongVersions();
        $scope.general_settings = SettingsService.getSettings()


        $scope.updateSettings = function () {
          SettingsService.setSettings($scope.general_settings)
          MessageService.success('Settings updated successfully!')
        }

        // Initialize used title items
        $scope.nodeTitleItems = ListConfig.getTitleItems('kongnode');


        // Initialize default sort data

        $scope.paging = {
          currentPage: 1,
        };

        $scope.sort = {
          column: 'createdAt',
          direction: false,
        };

        // Initialize filters
        $scope.filters = {
          searchWord: '',
          columns: $scope.nodeTitleItems,
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


        $scope.pageChanged = function () {
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
        }, true);


        // User delete dialog buttons configuration
        $scope.confirmButtonsDelete = {
          ok: {
            label: 'Delete',
            className: 'btn-danger btn-link',
            callback: function callback(result, node) {
              console.log(node)
              //$scope.deleteNode();
            }
          },
          cancel: {
            label: 'Cancel',
            className: 'btn-default btn-link'
          }
        };


        $scope.deleteNode = function deleteNode(node) {


          if ($scope.user.node && $scope.user.node.id == node.id) {
            $ngBootbox.alert('<p class="lead">Sorry...</p>Active nodes cannot be deleted.<br><br>Deactivate it and try again.')
              .then(function () {
              });
            return false;
          }

          DialogService.confirm(
            "Confirm", "Really want to delete the selected item?",
            ['No don\'t', 'Yes! delete it'],
            function accept() {
              NodeModel
                .delete(node.id)
                .then(
                  function onSuccess(data) {
                    if (data.status < 204) {
                      MessageService.success('Connection deleted successfully');
                      $rootScope.$broadcast('kong.node.deleted', node)
                      _triggerFetchData()
                    }
                  }
                ).catch(function(error){
                  console.error("Failed to delete node", error);
              })
              ;
            }, function decline() {
            })


        };


        $scope.toggleHealthChecks = function (node) {
          NodeModel.update(node.id, {
            health_checks: !node.health_checks
          }).then(function (_node) {
            node.health_checks = !node.health_checks
            MessageService.success("Health checks " + (node.health_checks ? " enabled" : " disabled") + " for the specified node")
          })
        }

        $scope.onShowStatusCheck = function (node) {
          $uibModal.open({
            animation: true,
            ariaLabelledBy: 'modal-title',
            ariaDescribedBy: 'modal-body',
            templateUrl: 'js/app/connections/node-status-check-modal.html',
            controller: function (_, $scope, $rootScope, $log, $uibModalInstance, NodeModel, _node) {


              $scope.close = function () {
                $uibModalInstance.dismiss()
              }

              NodeModel.fetch(_node.id).then(function (node) {
                $scope.node = node
              })


              $scope.toggleHealthChecks = function (node) {
                NodeModel.update(node.id, {
                  health_checks: node.health_checks
                }).then(function (_node) {
                  $rootScope.$broadcast('kong.node.updated', _node)
                  MessageService.success("Health checks " + (node.health_checks ? " enabled" : " disabled") + " for the specified node")
                })
              }

              $rootScope.$on('node.health_checks', function (event, data) {
                if (data.node_id == $scope.node.id) {
                  $scope.node.health_check_details = data
                  $scope.$apply()
                }
              })

            },
            resolve: {
              _node: function () {
                return node
              }
            }
          });
        }


        $scope.toggleActive = function (node) {


          if (!isActive(node)) {

            // Check connection before assigning
            // the node to the user
            node.checkingConnection = true;
            $http.get('kong', {
              params: {
                connection_id: node.id
              }
            }).then(function (response) {
              $log.debug("Check connection:success", response)
              node.checkingConnection = false;
              if (node.kong_version !== response.data.version) {
                node.kong_version = response.data.version;
              }

              toggleUserNode(node);

            }).catch(function (error) {
              $log.debug("Check connection:error", error)
              node.checkingConnection = false;
              MessageService.error("Oh snap! Can't connect to " + node.kong_admin_url)
            })

          } else {
            console.log("node active")
            toggleUserNode(node)
          }

        }


        function toggleUserNode(node) {

          if(window.no_auth) {
            var credentials = $localStorage.credentials;
            if(credentials.user.node && credentials.user.node.id == node.id) {
              delete credentials.user.node;
            }else{
              credentials.user.node = node;
            }
            $rootScope.$broadcast('user.node.updated', credentials.user.node)
          }else{
            UserModel
              .update(UserService.user().id, {
                node: isActive(node) ? null : node
              }).then(function onSuccess(res) {
              var credentials = $localStorage.credentials
              var user = res.data;
              if (!user.node) {
                delete credentials.user.node;
              } else {
                credentials.user.node = node;
              }

              $rootScope.$broadcast('user.node.updated', res.data.node)
            })
          }
        }


        $scope.updateNode = function (node) {

          NodeModel
            .update(node.id, node)
            .then(
              function onSuccess(result) {
                $rootScope.$broadcast('kong.node.updated', result.data)
                //if(!node.active) showTestNodeModal(node)

                // Update User node if it is the same as the updated node
                var user = UserService.user();
                if (user.node && user.node.id === node.id) {
                  UserModel
                    .update(user.id, {
                      node: result.data
                    }).then(function onSuccess(res) {
                    var credentials = $localStorage.credentials
                    var user = res.data;
                    if (!user.node) {
                      delete credentials.user.node;
                    } else {
                      credentials.user.node = node;
                    }

                    _fetchGatewayInfo(credentials.user.node);
                  });
                }
              }, function (err) {
                $scope.busy = false
                NodeModel.handleError($scope, err)
              }
            )
          ;
        }


        function _fetchGatewayInfo(node) {
          InfoService.getInfo()
            .then(function (response) {
              $rootScope.Gateway = response.data
              $log.debug("ConnectionsController:onUserNodeUpdated:Gateway Info =>", $rootScope.Gateway);
              $rootScope.$broadcast('user.node.updated', node);
            }).catch(function (err) {
            $rootScope.Gateway = null;
          });
        }


        function createNode() {
          $uibModal.open({
            animation: true,
            ariaLabelledBy: 'modal-title',
            ariaDescribedBy: 'modal-body',
            templateUrl: 'js/app/connections/create-connection-modal.html',
            controller: 'CreateConnectionController'
          });
        }

        function editNode(node) {
          $uibModal.open({
            animation: true,
            ariaLabelledBy: 'modal-title',
            ariaDescribedBy: 'modal-body',
            templateUrl: 'js/app/connections/create-connection-modal.html',
            controller: 'EditConnectionController',
            resolve: {
              _node: function () {
                return node;
              }
            }
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
          var count = NodeModel
            .count()
            .then(
              function onSuccess(response) {
                console.log(response)
                $scope.itemCount = response.count;
                if ($scope.itemCount == 0) {
                  // Set Gateway to null to prevent unwanted panic in other pages
                  $rootScope.Gateway = null;
                  // createNode()
                }
              }
            );


          // Fetch actual data
          var load = NodeModel
            .load(_.merge({}, commonParameters, parameters))
            .then(
              function onSuccess(response) {
                console.log(response)
                $scope.nodes = response;
                updateActiveKongConnectionVersion();

              }
            );

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

        $scope.$on('kong.node.updated', function (ev, node) {
          _triggerFetchData();
          if(UserService.user().node && node.id === UserService.user().node.id) {
            updateUserNode(node);
          }
        })

        $scope.$on('kong.node.deactivated', function (ev, node) {
          //updateUserNode()
        })

        $scope.$on('kong.node.activated', function (ev, node) {
          updateUserNode(node)
        })
        $scope.$on('kong.node.created', function (ev, node) {
          _triggerFetchData()
        })

        $scope.$on('kong.node.deleted', function (ev, node) {
          _triggerFetchData()
          if (UserService.user().node && UserService.user().node.id == node.id) updateUserNode()
        })

        $rootScope.$on('node.health_checks', function (event, data) {

          for (var i = 0; i < $scope.nodes.length; i++) {
            if (data.node_id == $scope.nodes[i].id) {
              $scope.nodes[i].health_check_details = data
              $scope.$apply()
            }
          }

        })

        function updateUserNode(node) {
          UserModel
            .update(UserService.user().id, {
              node: node
            })
            .then(
              function onSuccess(res) {
                var credentials = $localStorage.credentials
                credentials.user.node = node
                $rootScope.$broadcast('user.node.updated', node)
              }
            );
        }

        function isActive(node) {
          return UserService.user().node && node.id == UserService.user().node.id;
        }


        _triggerFetchData()


        $rootScope.$watch('Gateway',function(newVal,oldVal){
          if(newVal){
            updateActiveKongConnectionVersion();
          }
        })

        function updateActiveKongConnectionVersion() {
          if(!$rootScope.Gateway || !$scope.nodes) {
            return false;
          }

          var activeNode = getActiveNode();

          if(activeNode && activeNode.kong_version !== $rootScope.Gateway.version) {

            console.log("##############################");
            console.log("UPDATING ACTIVE CONNECTION KONG VERSION");
            console.log("_______________________________________");
            console.log("Gateway version", $rootScope.Gateway.version);
            console.log("Active connection Kong version", activeNode.kong_version);
            console.log("##############################");


            NodeModel
              .update(activeNode.id, {
                kong_version : $rootScope.Gateway.version
              })
              .then(
                function onSuccess(result) {
                  MessageService.success('Active node version updated');
                  $rootScope.$broadcast('kong.node.updated',result.data);
                },function(err){
                  NodeModel.handleError($scope,err);
                }
              )
            ;
          }


        }

        function getActiveNode() {
          return _.find($scope.nodes, function (node) {
            return isActive(node);
          })
        }


        updateActiveKongConnectionVersion();
      }
    ])
  ;
}());
