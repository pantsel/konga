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
    .controller('FooterController', ['_','$scope','$state','AuthService',
        'SettingsService','MessageService',
        '$rootScope','NodeModel','SocketHelperService','$uibModal',
      function controller(_,$scope,$state,AuthService,
                          SettingsService,MessageService,
                          $rootScope,NodeModel,SocketHelperService,$uibModal) {

          var commonParameters = {
              where: SocketHelperService.getWhere({
                  searchWord: ''
              },{
                  active:true
              })
          };

          $scope.settings = SettingsService.getSettings()

          $scope.showConnectionsModal = function() {

                  $uibModal.open({
                      animation: true,
                      ariaLabelledBy: 'modal-title',
                      ariaDescribedBy: 'modal-body',
                      templateUrl: 'js/app/settings/modals/connections-modal.html',
                      controller: ['$scope','$uibModalInstance','$log','NodeModel','InfoService','_nodes',
                          function($scope,$uibModalInstance,$log,NodeModel,InfoService,_nodes){

                              $scope.connections = _nodes

                              $log.debug("connections",$scope.connections)

                              $scope.close = function(){
                                  $uibModalInstance.dismiss()
                              }

                              $scope.closeAlert = function(index) {
                                  $scope.alerts.splice(index, 1);
                              };

                              $scope.activateConnection = function(node) {

                                  $scope.alerts = [];

                                  if(node.active || node.checkingConnection) return false;


                                  // Check if the connection is valid
                                  node.checkingConnection = true;
                                  InfoService.nodeStatus({
                                      kong_admin_url : node.kong_admin_url
                                  }).then(function(response){
                                      $log.debug("Check connection:success",response)
                                      node.checkingConnection = false;


                                      NodeModel
                                          .update(node.id,{active:!node.active})
                                          .then(
                                              function onSuccess(result) {
                                                  $rootScope.$broadcast('kong.node.updated',result.data)
                                                  $rootScope.$broadcast('kong.node.activated',result.data)


                                                  $scope.close()

                                              },function(err){
                                                  $scope.busy = false
                                                  NodeModel.handleError($scope,err)
                                              }
                                          )
                                      ;

                                  }).catch(function(error){
                                      $log.debug("Check connection:error",error)
                                      node.checkingConnection = false;
                                      $scope.alerts.push({ type: 'danger', msg: 'Oh snap! Cannot connect to the selected node.' })
                                  })

                                  //function _fetchData() {
                                  //    NodeModel.load({
                                  //        sort: 'createdAt DESC'
                                  //    }).then(function(data){
                                  //        $scope.connections = data
                                  //    })
                                  //}


                              }
                      }],
                      controllerAs: '$ctrl',
                      resolve: {
                          _nodes: [
                              '_',
                              'ListConfig','SocketHelperService',
                              'NodeModel',
                              function resolve(
                                  _,
                                  ListConfig,SocketHelperService,
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

          function _triggerFetchData() {
              NodeModel.load(_.merge({}, commonParameters, {}))
                  .then(function(resp){
                      setNode(resp[0])
                  }).catch(function(err){
                  $scope.adminUrl = 'no node defined'
              })
          }

          function setNode(node) {
              var beforeNode = angular.copy($rootScope.$node)
              $rootScope.$node = node
              if(node) {
                  if(!beforeNode)
                    MessageService.success("Selected connection:  " + node.kong_admin_url)
                  $scope.adminUrl = $rootScope.$node.kong_admin_url;
              }else{
                  $scope.adminUrl = 'no connection defined'
              }

          }


          $scope.$on('kong.node.deleted',function(ev,node){
              if(node.id == $rootScope.$node.id) setNode(null)

          })

          $scope.$on('kong.node.updated',function(ev,node){
              if(node.active) {
                  setNode(node)
              }else{
                  _triggerFetchData()
              }
          })

          if(AuthService.isAuthenticated()) _triggerFetchData();
      }
    ])
  ;

  /**
   * Generic navigation controller for application layout. This contains all necessary logic for pages sub-navigation
   * section. Basically this handles following:
   *
   *  1) Sub navigation of the page
   *  2) Opening of information modal
   */
  angular.module('frontend.core.layout')
    .controller('NavigationController', [
      '$scope', '$state', '$modal',
      '_items',
      function controller(
        $scope, $state, $modal,
        _items
      ) {
        $scope.navigationItems = _items;
      }
    ])
  ;

  /**
   * Controller for navigation info modal. This is used to show GUI specified detailed information about how those
   * are done (links to sources + generic information / description).
   */
  angular.module('frontend.core.layout')
    .controller('NavigationModalController', [
      '$scope', '$modalInstance',
      'BackendConfig',
      '_title', '_files', '_template',
      function(
        $scope, $modalInstance,
        BackendConfig,
        _title, _files, _template
      ) {
        $scope.title = _title;
        $scope.files = _files;
        $scope.template = _template;
        $scope.backendConfig = BackendConfig;

        // Dismiss function for modal
        $scope.dismiss = function dismiss() {
          $modalInstance.dismiss();
        };
      }
    ])
  ;
}());
