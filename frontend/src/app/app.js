/**
 * Frontend application definition.
 *
 * This is the main file for the 'Frontend' application.
 */
(function() {
  'use strict';

  // Create frontend module and specify dependencies for that
  angular.module('frontend', [
      'angularUtils.directives.uiBreadcrumbs',
      'ngSanitize',
      'yaru22.jsonHuman',
      'cfp.loadingBar',
      'frapontillo.bootstrap-switch',
      'angular-spinkit',
      'frontend-templates',
      'frontend.core',
      'frontend.admin',


  ]);

  /**
   * Configuration for frontend application, this contains following main sections:
   *
   *  1) Configure $httpProvider and $sailsSocketProvider
   *  2) Set necessary HTTP and Socket interceptor(s)
   *  3) Turn on HTML5 mode on application routes
   *  4) Set up application routes
   */
  angular.module('frontend')
      .config(['$provide',function($provide) {
          $provide.decorator('$state', function($delegate) {
              var originalTransitionTo = $delegate.transitionTo;
              $delegate.transitionTo = function(to, toParams, options) {
                  return originalTransitionTo(to, toParams, angular.extend({
                      reload: true
                  }, options));
              };
              return $delegate;
          });
      }])
    .config([
      '$stateProvider', '$locationProvider', '$urlRouterProvider', '$httpProvider', '$sailsSocketProvider',
       'cfpLoadingBarProvider',
      'toastrConfig',
      'AccessLevels',
      function config(
        $stateProvider, $locationProvider, $urlRouterProvider, $httpProvider, $sailsSocketProvider,
         cfpLoadingBarProvider,
        toastrConfig,
        AccessLevels
      ) {
        $httpProvider.defaults.useXDomain = true;

        delete $httpProvider.defaults.headers.common['X-Requested-With'];

        // Add interceptors for $httpProvider and $sailsSocketProvider
        $httpProvider.interceptors.push('AuthInterceptor');
        $httpProvider.interceptors.push('ErrorInterceptor');

        // Iterate $httpProvider interceptors and add those to $sailsSocketProvider
        angular.forEach($httpProvider.interceptors, function iterator(interceptor) {
          $sailsSocketProvider.interceptors.push(interceptor);
        });



        // Disable spinner from cfpLoadingBar
        cfpLoadingBarProvider.includeSpinner = false;
        cfpLoadingBarProvider.latencyThreshold = 200;

        // Extend default toastr configuration with application specified configuration
        angular.extend(
          toastrConfig,
          {
            allowHtml: true,
            closeButton: true,
            extendedTimeOut: 3000
          }
        );

        // Yeah we wanna to use HTML5 urls!
        $locationProvider
          .html5Mode({
            enabled: true,
            requireBase: false
          })
          .hashPrefix('!');

        // Routes that needs authenticated user
        //$stateProvider
        //  .state('profile', {
        //    abstract: true,
        //    template: '<ui-view/>',
        //    data: {
        //      access: AccessLevels.user
        //    }
        //  })
        //  .state('profile.edit', {
        //    url: '/profile',
        //    templateUrl: '/frontend/profile/profile.html',
        //    controller: 'ProfileController'
        //  })
        //;

        // Main state provider for frontend application
        $stateProvider
          .state('frontend', {
            abstract: true,
            views: {
              header: {
                templateUrl: '/frontend/core/layout/partials/header.html',
                controller: 'HeaderController'
              },
              footer: {
                templateUrl: '/frontend/core/layout/partials/footer.html',
                controller: 'FooterController'
              }
            }
          })
        ;

        // For any unmatched url, redirect to /admin
        $urlRouterProvider.otherwise('/admin');
      }
    ])
  ;


  /**
   * Frontend application run hook configuration. This will attach auth status
   * check whenever application changes URL states.
   */
  angular.module('frontend')
    .run([
      '$rootScope', '$state', '$injector',
      'editableOptions','editableThemes','$templateCache',
      'AuthService','cfpLoadingBar',
      function run(
        $rootScope, $state, $injector,
        editableOptions,editableThemes,$templateCache,
        AuthService,cfpLoadingBar
      ) {





          editableThemes.bs3.buttonsClass = 'btn-sm btn-link';

          // Set usage of Bootstrap 3 CSS with angular-xeditable
          editableOptions.theme = 'bs3';

        /**
         * Route state change start event, this is needed for following:
         *  1) Check if user is authenticated to access page, and if not redirect user back to login page
         */
        $rootScope.$on('$stateChangeStart', function stateChangeStart(event, toState) {

            cfpLoadingBar.start();

          if (!AuthService.authorize(toState.data.access)) {

            event.preventDefault();

            $state.go('auth.login');
          }

        });

          $rootScope.$on('$stateChangeSuccess', function stateChangeStart(event, toState) {
              $rootScope.$state = toState
              cfpLoadingBar.complete()

          });


        $rootScope.isAuthenticated = function() {
            return AuthService.isAuthenticated()
        }

        // Check for state change errors.
        $rootScope.$on('$stateChangeError', function stateChangeError(event, toState, toParams, fromState, fromParams, error) {
          event.preventDefault();

          $injector.get('MessageService')
            .error('Error loading the page');

          $state.get('error').error = {
            event: event,
            toState: toState,
            toParams: toParams,
            fromState: fromState,
            fromParams: fromParams,
            error: error
          };

          return $state.go('error');
        });
      }
    ])
  ;
}());
