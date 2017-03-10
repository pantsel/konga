/**
 * Service to wrap generic HTTP status specified helper methods. Currently this service has
 * following methods available:
 *
 *  HttpStatusService.getStatusCodeText(httpStatusCode);
 *
 * @todo add more these helpers :D
 */
(function() {
  'use strict';

  angular.module('frontend.core.services')
    .factory('HttpStatusService',
      function factory() {
        return {
          /**
           * Getter method for HTTP status message by given status code.
           *
           * @param   {Number}  statusCode  HTTP status code
           *
           * @returns {String}              Status message
           */
          getStatusCodeText: function getStatusCodeText(statusCode) {
            var output = '';

            switch (parseInt(statusCode.toString(), 10)) {
              // 1xx Informational
              case 100:
                output = 'Continue';
                break;
              case 101:
                output = 'Switching Protocols';
                break;
              case 102:
                output = 'Processing (WebDAV; RFC 2518)';
                break;
              // 2xx Success
              case 200:
                output = 'OK';
                break;
              case 201:
                output = 'Created';
                break;
              case 202:
                output = 'Accepted';
                break;
              case 203:
                output = 'Non-Authoritative Information (since HTTP/1.1)';
                break;
              case 204:
                output = 'No Content';
                break;
              case 205:
                output = 'Reset Content';
                break;
              case 206:
                output = 'Partial Content';
                break;
              case 207:
                output = 'Multi-Status (WebDAV; RFC 4918)';
                break;
              case 208:
                output = 'Already Reported (WebDAV; RFC 5842)';
                break;
              case 226:
                output = 'IM Used (RFC 3229)';
                break;
              // 3xx Redirection
              case 300:
                output = 'Multiple Choices';
                break;
              case 301:
                output = 'Moved Permanently';
                break;
              case 302:
                output = 'Found';
                break;
              case 303:
                output = 'See Other';
                break;
              case 304:
                output = 'Not Modified';
                break;
              case 305:
                output = 'Use Proxy';
                break;
              case 306:
                output = 'Switch Proxy';
                break;
              case 307:
                output = 'Temporary Redirect';
                break;
              case 308:
                output = 'Permanent Redirect (Experimental RFC; RFC 7238)';
                break;
              // 4xx Client Error
              case 400:
                output = 'Bad Request';
                break;
              case 401:
                output = 'Unauthorized';
                break;
              case 402:
                output = 'Payment Required';
                break;
              case 403:
                output = 'Forbidden';
                break;
              case 404:
                output = 'Not Found';
                break;
              case 405:
                output = 'Method Not Allowed';
                break;
              case 406:
                output = 'Not Acceptable';
                break;
              case 407:
                output = 'Proxy Authentication Required';
                break;
              case 408:
                output = 'Request Timeout';
                break;
              case 409:
                output = 'Conflict';
                break;
              case 410:
                output = 'Gone';
                break;
              case 411:
                output = 'Length Required';
                break;
              case 412:
                output = 'Precondition Failed';
                break;
              case 413:
                output = 'Request Entity Too Large';
                break;
              case 414:
                output = 'Request-URI Too Long';
                break;
              case 415:
                output = 'Unsupported Media Type';
                break;
              case 416:
                output = 'Requested Range Not Satisfiable';
                break;
              case 417:
                output = 'Expectation Failed';
                break;
              case 418:
                output = 'I\'m a teapot (RFC 2324)';
                break;
              case 419:
                output = 'Authentication Timeout (not in RFC 2616)';
                break;
              case 420:
                output = 'Method Failure (Spring Framework) / Enhance Your Calm (Twitter)';
                break;
              case 422:
                output = 'Unprocessable Entity (WebDAV; RFC 4918)';
                break;
              case 423:
                output = 'Locked (WebDAV; RFC 4918)';
                break;
              case 424:
                output = 'Failed Dependency (WebDAV; RFC 4918)';
                break;
              case 426:
                output = 'Upgrade Required';
                break;
              case 428:
                output = 'Precondition Required (RFC 6585)';
                break;
              case 429:
                output = 'Too Many Requests (RFC 6585)';
                break;
              case 431:
                output = 'Request Header Fields Too Large (RFC 6585)';
                break;
              case 440:
                output = 'Login Timeout (Microsoft)';
                break;
              case 444:
                output = 'No Response (Nginx)';
                break;
              case 449:
                output = 'Retry With (Microsoft)';
                break;
              case 450:
                output = 'Blocked by Windows Parental Controls (Microsoft)';
                break;
              case 451:
                output = 'Unavailable For Legal Reasons (Internet draft) / Redirect (Microsoft)';
                break;
              case 494:
                output = 'Request Header Too Large (Nginx)';
                break;
              case 495:
                output = 'Cert Error (Nginx)';
                break;
              case 496:
                output = 'No Cert (Nginx)';
                break;
              case 497:
                output = 'HTTP to HTTPS (Nginx)';
                break;
              case 498:
                output = 'Token expired/invalid (Esri)';
                break;
              case 499:
                output = 'Client Closed Request (Nginx) / Token required (Esri)';
                break;
              // 5xx Server Error
              case 500:
                output = 'Internal Server Error';
                break;
              case 501:
                output = 'Not Implemented';
                break;
              case 502:
                output = 'Bad Gateway';
                break;
              case 503:
                output = 'Service Unavailable';
                break;
              case 504:
                output = 'Gateway Timeout';
                break;
              case 505:
                output = 'HTTP Version Not Supported';
                break;
              case 506:
                output = 'Variant Also Negotiates (RFC 2295)';
                break;
              case 507:
                output = 'Insufficient Storage (WebDAV; RFC 4918)';
                break;
              case 508:
                output = 'Loop Detected (WebDAV; RFC 5842)';
                break;
              case 509:
                output = 'Bandwidth Limit Exceeded (Apache bw/limited extension)';
                break;
              case 510:
                output = 'Not Extended (RFC 2774)';
                break;
              case 511:
                output = 'Network Authentication Required (RFC 6585)';
                break;
              case 520:
                output = 'Origin Error (Cloudflare)';
                break;
              case 521:
                output = 'Web server is down (Cloudflare)';
                break;
              case 522:
                output = 'Connection timed out (Cloudflare)';
                break;
              case 523:
                output = 'Proxy Declined Request (Cloudflare)';
                break;
              case 524:
                output = 'A timeout occurred (Cloudflare)';
                break;
              case 598:
                output = 'Network read timeout error (Unknown)';
                break;
              case 599:
                output = 'Network connect timeout error (Unknown)';
                break;
              default:
                output = 'Unknown HTTP status \'' + statusCode + '\', what is this?';
                break;
            }

            return output;
          }
        };
      }
    )
  ;
}());
