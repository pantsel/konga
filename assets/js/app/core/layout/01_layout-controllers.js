/**
 * This file contains all necessary Angular controller definitions for 'frontend.core.layout' module.
 *
 * Note that this file should only contain controllers and nothing else.
 */
(function () {
  'use strict';

  /**
   * Generic header controller for application layout. this contains all necessary logic which is used on application
   * header section. Basically this contains following:
   *
   *  1) Main navigation
   *  2) Login / Logout
   *  3) Profile
   */
  angular.module('frontend.core.layout')
    .controller('HeaderController', [
      '$scope', '$state', '$rootScope',
      'HeaderNavigationItems',
      'UserService', 'AuthService', 'NotificationsService', '$localStorage',
      function controller($scope, $state, $rootScope,
                          HeaderNavigationItems,
                          UserService, AuthService, NotificationsService, $localStorage) {
        $scope.user = UserService.user;
        $scope.no_auth = window.no_auth;
        $scope.auth = AuthService;
        $scope.navigationItems = HeaderNavigationItems;
        $scope.notifications = NotificationsService.load();

        /**
         * Helper function to determine if menu item needs 'not-active' class or not. This is basically
         * special case because of 'examples.about' state.
         *
         * @param   {layout.menuItem}   item    Menu item object
         *
         * @returns {boolean}
         */
        $scope.isNotActive = function isNotActive(item) {
          return !!(item.state === 'examples' && $state.current.name === 'examples.about');
        };

        /**
         * Helper function to determine if specified menu item needs 'active' class or not. This is needed
         * because of reload of page, in this case top level navigation items are not activated without
         * this helper.
         *
         * @param   {layout.menuItem}   item    Menu item object
         *
         * @returns {boolean}
         */
        $scope.isActive = function isActive(item) {
          var bits = $state.current.name.toString().split('.');

          return !!(
            (item.state === $state.current.name) ||
            (item.state === bits[0])
          );
        };

        // Simple helper function which triggers user logout action.
        $scope.logout = function logout() {
          AuthService.logout();
        };

        $scope.$on('user.updated', function (ev, user) {
          $scope.user = UserService.user;
        })


        $scope.$watch(function () {
          return $localStorage.notifications;
        }, function (newVal, oldVal) {
          if (oldVal !== newVal && newVal !== undefined) {
            $scope.notifications = newVal;
          }
        })


        $scope.removeNotification = function (index) {
          NotificationsService.remove(index)
        }

        $scope.$on('snapshots.created', function (ev, message) {
          NotificationsService.add({
            icon: 'mdi-camera',
            message: "Snapshot '" + message.data.name + "' created!"
          });

        })


        $scope.toggleSideNav = function () {
          $rootScope.$broadcast('sidenav-toggle');
        };
      }
    ])
  ;

  /**
   * Generic footer controller for application layout. This contains all necessary logic which is used on application
   * footer section. Basically this contains following:
   *
   *  1) Generic links
   *  2) Version info parsing (back- and frontend)
   */
  angular.module('frontend.core.layout')
    .controller('FooterController', ['_', '$scope', '$state', 'AuthService', 'InfoService', 'UserModel', '$localStorage',
      'SettingsService', 'MessageService', 'UserService', '$log',
      '$rootScope', 'NodeModel', '$http', '$uibModal',
      function controller(_, $scope, $state, AuthService, InfoService, UserModel, $localStorage,
                          SettingsService, MessageService, UserService, $log,
                          $rootScope, NodeModel, $http, $uibModal) {


        $scope.user = UserService.user();
        $scope.closeDropdown = function () {
          $scope.isOpen = false;
        }

        console.log("FooterController:user =>", $scope.user)


        function _fetchConnections() {
          $http.get('api/kongnode').then(function (response) {
            $scope.connections = response.data;
          });
          // NodeModel.load({
          //   sort: 'createdAt DESC'
          // }).then(function (connections) {
          //   console.log("!!!!!!!!!!!!!!!!!!!!!!!!!", connections);
          //   $scope.connections = connections;
          // });
        }

        $scope.activateConnection = function (node) {

          $scope.alerts = [];

          if ((UserService.user().node && UserService.user().node.id == node.id) || node.checkingConnection) {
            return false;
          }

          // Check if the connection is valid
          node.checkingConnection = true;
          $http.get('kong', {
            params: {
              connection_id: node.id
            }
          }).then(function (response) {
            console.log("Check connection:success", response)
            node.checkingConnection = false;

            UserModel
              .update(UserService.user().id, {
                node: node
              })
              .then(function onSuccess(res) {
                  var credentials = $localStorage.credentials
                  credentials.user.node = node


                  // Update $rootScope.Gateway
                  _fetchGatewayInfo(node);

                }, function (err) {
                  $scope.busy = false
                  UserModel.handleError($scope, err)
                  MessageService.error(_.get(err, 'data.message', 'Something went wrong...'))
                }
              );

          }).catch(function (error) {
            console.log("Check connection:error", error)
            node.checkingConnection = false;
            MessageService.error("Oh snap! Can't connect to " + node.kong_admin_url)
          })

        }

        $scope.$on('kong.node.created', function (ev, node) {
          _fetchConnections();
        })

        $scope.$on('kong.node.updated', function (ev, node) {
          _fetchConnections();
        })

        $scope.$on('kong.node.deleted', function (ev, node) {
          _fetchConnections();
        })

        if (AuthService.isAuthenticated()) {
          _fetchConnections();
        }


        function _fetchGatewayInfo(node) {
          InfoService.getInfo()
            .then(function (response) {
              $rootScope.Gateway = response.data
              console.log("FooterController:onUserNodeUpdated:Gateway Info =>", $rootScope.Gateway);
              $rootScope.$broadcast('user.node.updated', node);
            }).catch(function (err) {
            $rootScope.Gateway = null;
          });
        }

      }
    ])
  ;


  angular.module('frontend.core.layout')
    .controller('SidenavController', ['_', '$scope', '$state', 'AuthService', 'InfoService', 'UserModel', '$localStorage',
      'SettingsService', 'MessageService', 'UserService', '$log',
      '$rootScope', 'AccessLevels', 'SocketHelperService', '$uibModal', 'Semver',
      function controller(_, $scope, $state, AuthService, InfoService, UserModel, $localStorage,
                          SettingsService, MessageService, UserService, $log,
                          $rootScope, AccessLevels, SocketHelperService, $uibModal, Semver) {


        $scope.auth = AuthService;
        $scope.user = UserService.user();


        $scope.items = [
          {
            state: 'dashboard',
            icon: 'mdi-view-dashboard',
            show: function () {
              return AuthService.isAuthenticated()
            },
            title: 'Dashboard',
            access: AccessLevels.user
          },
          {
            title: 'API Gateway',
            show: function () {
              return AuthService.isAuthenticated() && $rootScope.Gateway
            },
            access: AccessLevels.user
          },
          {
            state: 'info',
            show: function () {
              return AuthService.isAuthenticated() && $rootScope.Gateway
            },
            title: 'Info',
            icon: 'mdi-information-outline',
            access: AccessLevels.admin
          },
          {
            state: 'services',
            show: function () {
              return AuthService.hasPermission('services', 'read') && $rootScope.isGatewayVersionEqOrGreater('0.13.0')
            },
            title: 'Services',
            icon: 'mdi-cloud-outline',
            access: AccessLevels.user
          },
          {
            state: 'routes',
            show: function () {
              return AuthService.hasPermission('routes', 'read') && $rootScope.isGatewayVersionEqOrGreater('0.13.0')
            },
            title: 'Routes',
            icon: 'mdi-directions-fork',
            access: AccessLevels.user
          },
          // {
          //   state: 'apis',
          //   show: function () {
          //     return AuthService.hasPermission('apis', 'read')  && $rootScope.isGatewayVersionSmaller('1.0.0-rc1')
          //   },
          //   title: 'APIs <small>(deprecated)</small>',
          //   icon: 'mdi-cloud-outline',
          //   access: AccessLevels.user
          // },
          {
            state: 'consumers',
            show: function () {
              return AuthService.hasPermission('consumers', 'read') && $rootScope.Gateway
            },
            title: 'Consumers',
            icon: 'mdi-account-outline',
            access: AccessLevels.user
          },
          {
            state: 'plugins',
            icon: 'mdi-power-plug',
            show: function () {
              return AuthService.hasPermission('plugins', 'read') && $rootScope.Gateway
            },
            title: 'Plugins',
            access: AccessLevels.anon
          },
          {
            state: 'upstreams',
            icon: 'mdi-shuffle-variant',
            show: function () {
              return AuthService.hasPermission('upstreams', 'read') && UserService.user().node && $rootScope.isGatewayVersionEqOrGreater('0.10.0');
            },
            title: 'Upstreams',
            access: AccessLevels.anon
          },
          {
            state: 'certificates',
            icon: 'mdi-certificate',
            show: function () {
              return AuthService.hasPermission('certificates', 'read') && UserService.user().node && $rootScope.isGatewayVersionEqOrGreater('0.10.0');
            },
            title: 'Certificates',
            access: AccessLevels.anon
          },
          {
            title: 'Application',
            show: function () {
              return AuthService.hasPermission('users', 'read') || AuthService.hasPermission('connections', 'read');
            },
            access: AccessLevels.user
          },
          {
            state: 'users',
            icon: 'mdi-account-multiple-outline',
            show: function () {
              if(window.no_auth) return false;
              return AuthService.isAuthenticated() && AuthService.hasPermission('users', 'read');
            },
            title: 'Users',
            access: AccessLevels.anon
          },
          {
            state: 'connections',
            icon: 'mdi-cast-connected',
            show: function () {
              return AuthService.isAuthenticated() && AuthService.hasPermission('connections', 'read');
            },
            title: 'Connections',
            access: AccessLevels.anon
          },
          {
            state: 'snapshots',
            icon: 'mdi-camera',
            show: function () {
              return AuthService.authorize(AccessLevels.admin);
            },
            title: 'Snapshots',
            access: AccessLevels.admin
          },
          // {
          //   state: 'healthchecks',
          //   icon: 'mdi-heart-outline',
          //   show: function () {
          //     return AuthService.authorize(AccessLevels.admin);
          //   },
          //   title: 'Health Checks',
          //   access: AccessLevels.admin
          // },
          {
            state: 'settings',
            icon: 'mdi-settings',
            show: function () {
              return AuthService.authorize(AccessLevels.admin);
            },
            title: 'Settings',
            access: AccessLevels.admin
          },
        ];
      }

    ])
  ;
}());
