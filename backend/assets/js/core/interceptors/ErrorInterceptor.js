/**
 * Interceptor for $http and $sailSocket request to handle possible errors and show
 * that error to user automatically. Message is shown by application 'Message' service
 * which uses noty library.
 *
 * @todo Add option to skip showing automatic error message
 */
(function() {
  'use strict';

  angular.module('frontend.core.interceptors')
    .factory('ErrorInterceptor', [
      '$q', '$injector',
      function($q, $injector) {
        return {
          /**
           * Interceptor method which is triggered whenever response occurs on $http queries. Note
           * that this has some sails.js specified hack for errors that returns HTTP 200 status.
           *
           * This is maybe sails.js bug, but I'm not sure of that.
           *
           * @param   {*} response
           *
           * @returns {*|Promise}
           */
          response: function responseCallback(response) {
            if (response.data.error &&
              response.data.status &&
              response.data.status !== 200
            ) {
              return $q.reject(response);
            } else {
              return response || $q.when(response);
            }
          },

          /**
           * Interceptor method that is triggered whenever response error occurs on $http requests.
           *
           * @param   {*} response
           *
           * @returns {*|Promise}
           */
          responseError: function responseErrorCallback(response) {
            var message = '';

            if (response.data && response.data.error) {
              message = response.data.error;
            } else if (response.data && response.data.message) {
              message = response.data.message;
            } else {
              if (typeof response.data === 'string') {
                message = response.data;
              } else if (response.statusText) {
                message = response.statusText;
              } else {
                message = $injector.get('HttpStatusService').getStatusCodeText(response.status);
              }

              message = message + ' <span class="text-small">(HTTP status ' + response.status + ')</span>';
            }

            if (message) {
              $injector.get('MessageService').error(message);
            }

            return $q.reject(response);
          }
        };
      }
    ])
  ;
}());
