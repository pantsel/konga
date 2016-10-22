/**
 * Generic 'focus' component for boilerplate application. Purpose of this component is to provide an easy way to trigger
 * focus to specified input whenever needed.
 *
 * @link    https://stackoverflow.com/questions/14833326/how-to-set-focus-on-input-field/18295416#18295416
 */
(function() {
  'use strict';

  /**
   * Directive definition for 'focus' component. This will listen 'focusOn' event on scope, and whenever that's
   * fired directive will check if that event is attached to current element.
   *
   * Usage example:
   *  <input type="text" data-focus-on="focusMe" />
   *
   * This will attach 'focusOn' event with 'focusMe' parameter to trigger focus of this element.
   */
  angular.module('frontend.core.components')
    .directive('focusOn', [
      '$timeout',
      function directive($timeout) {
        /**
         * Actual directive return function.
         *
         * @param   {angular.scope}     scope   Angular scope object.
         * @param   {angular.element}   element jqLite-wrapped element that this directive matches.
         */
        return function focusOn(scope, element) {
          scope.$on('focusOn', function focusOnEvent(event, identifier) {
            if (element.data('focusOn') && identifier === element.data('focusOn')) {
              $timeout(function timeout() {
                element.focus();
              }, 0, false);
            }
          });
        };
      }
    ])
  ;

  /**
   * Service for focus component. This is need for actual element focus events which can be activated from another
   * components like controllers and services.
   *
   * Usage example:
   *  angular.module('frontend.controllers')
   *    .controller('MyCtrl', [
   *      '$scope', 'FocusOnService',
   *      function($scope, FocusOnService) {
   *        focusOnService('focusMe');
   *      }
   *    ])
   *  ;
   *
   * This will trigger focus to input element that has 'data-focus-on' attribute set with value 'focusMe'.
   */
  angular.module('frontend.core.components')
    .factory('FocusOnService', [
      '$rootScope', '$timeout',
      function factory($rootScope, $timeout) {
        /**
         * Actual functionality for this service. This will just broadcast 'focusOn' event with specified
         * identifier, which is catch on 'focus' component directive.
         *
         * @param   {string}    identifier  Identifier for 'data-focus-on' attribute
         */
        return {
          'focus': function focus(identifier) {
            $timeout(function timeout() {
              $rootScope.$broadcast('focusOn', identifier);
            }, 0, false);
          }
        };
      }
    ])
  ;
}());
