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
        '$rootScope','NodeModel','SocketHelperService',
      function controller(_,$scope,$state,AuthService,
                          SettingsService,MessageService,
                          $rootScope,NodeModel,SocketHelperService) {

          var commonParameters = {
              where: SocketHelperService.getWhere({
                  searchWord: ''
              },{
                  active:true
              })
          };

          $scope.settings = SettingsService.getSettings()

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
