/**
 * This file contains all necessary Angular controller definitions for 'frontend.core.layout' module.
 *
 * Note that this file should only contain controllers and nothing else.
 */
(function() {
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
      '$scope', '$state',
      'HeaderNavigationItems',
      'UserService', 'AuthService',
      function controller(
        $scope, $state,
        HeaderNavigationItems,
        UserService, AuthService
      ) {
        $scope.user = UserService.user;
        $scope.auth = AuthService;
        $scope.navigationItems = HeaderNavigationItems;

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

          $scope.$on('user.updated',function(ev,user){
              $scope.user = UserService.user;
          })
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
    .controller('FooterController', ['_','$scope','$state','AuthService','InfoService','UserModel','$localStorage',
        'SettingsService','MessageService','UserService','$log',
        '$rootScope','NodeModel','SocketHelperService','$uibModal',
      function controller(_,$scope,$state,AuthService,InfoService,UserModel,$localStorage,
                          SettingsService,MessageService,UserService,$log,
                          $rootScope,NodeModel,SocketHelperService,$uibModal) {


          $scope.user = UserService.user();
          $scope.closeDropdown = function() {
              $scope.isOpen = false;
          }

          $log.debug("FooterController:user =>",$scope.user)

          function _fetchConnections() {
              NodeModel.load({
                  sort: 'createdAt DESC'
              }).then(function(connections){
                  $scope.connections = connections;
              })
          }



          $scope.showConnectionsModal = function() {

                  $uibModal.open({
                      animation: true,
                      ariaLabelledBy: 'modal-title',
                      ariaDescribedBy: 'modal-body',
                      templateUrl: 'js/app/settings/modals/connections-modal.html',
                      controller: 'UpdateUserNodeController',
                      controllerAs: '$ctrl',
                      resolve: {
                          _nodes: [
                              'NodeModel',
                              function resolve(
                                  NodeModel
                              ) {
                                  return NodeModel.load({
                                      sort: 'createdAt DESC'
                                  });
                              }
                          ]
                      }
                  });
          }

          $scope.activateConnection = function(node) {

              $scope.alerts = [];

              if(($rootScope.user.node && $rootScope.user.node.id == node.id ) || node.checkingConnection) return false;


              // Check if the connection is valid
              node.checkingConnection = true;
              InfoService.nodeStatus({
                  kong_admin_url : node.kong_admin_url
              }).then(function(response){
                  $log.debug("Check connection:success",response)
                  node.checkingConnection = false;

                  UserModel
                      .update(UserService.user().id, {
                          node : node
                      })
                      .then(
                          function onSuccess(res) {
                              var credentials = $localStorage.credentials
                              credentials.user.node = node
                              $rootScope.$broadcast('user.node.updated',node)
                          },function(err){
                              $scope.busy = false
                              UserModel.handleError($scope,err)
                          }
                      );

              }).catch(function(error){
                  $log.debug("Check connection:error",error)
                  node.checkingConnection = false;
                  MessageService.error("Oh snap! Can't connect to the selected node.")
              })

          }

          $scope.$on('kong.node.created',function(ev,node){
            _fetchConnections()
          })

          $scope.$on('kong.node.updated',function(ev,node){
              _fetchConnections()
          })

          $scope.$on('kong.node.deleted',function(ev,node){
              _fetchConnections()
          })

          function _subscribe() {

              io.socket.get('/api/kongnodes/healthchecks/subscribe?token=' + AuthService.token(),
                  function(data, jwr){
                      //$log.info("NotifSub:data",data)
                      //$log.info("NotifSub:jwr",jwr)

                      if (jwr.statusCode == 200){
                          //$log.info("Subscribing to room",data.room)
                          io.socket.on(data.room,function(obj){
                              //$log.info("Notification received",obj)
                              $rootScope.$broadcast("node.health_checks",obj)

                          });
                      } else {
                          $log.info(jwr);
                      }
                  });

              io.socket.get('/api/apis/healthchecks/subscribe?token=' + AuthService.token(),
                  function(data, jwr){
                      //$log.info("ApiHealthChecksSub:data",data)
                      //$log.info("ApiHealthChecksSub:jwr",jwr)

                      if (jwr.statusCode == 200){
                          //$log.info("Subscribing to room",data.room)
                          io.socket.on(data.room,function(obj){
                              //$log.info("Notification received",obj)
                              $rootScope.$broadcast("api.health_checks",obj)

                          });
                      } else {
                          $log.info(jwr);
                      }
                  });


          }


          if(AuthService.isAuthenticated()) {
              _fetchConnections()
              if(!io.socket.isConnecting) {
                  _subscribe()
              }
              io.socket.on('connect', function(){
                  _subscribe()
              });
          }

      }
    ])
  ;
}());
