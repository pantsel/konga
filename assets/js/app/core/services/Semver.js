/**
 * Generic data service to interact with Sails.js backend. This will just
 * wrap $sailsSocket methods to a single service, that is used from application.
 *
 * This is needed because we need to make some common url handling for sails
 * endpoint.
 */
(function() {
  'use strict';

  angular.module('frontend.core.services')
    .factory('Semver', [
      function factory() {

        return {
          cmp : function cmp (a, b) {
            var pa = a.split('.');
            var pb = b.split('.');
            for (var i = 0; i < 3; i++) {
              var na = Number(pa[i]);
              var nb = Number(pb[i]);
              if (na > nb) return 1;
              if (nb > na) return -1;
              if (!isNaN(na) && isNaN(nb)) return 1;
              if (isNaN(na) && !isNaN(nb)) return -1;
            }
            return 0;
          }
        }
      }
    ])
  ;
}());
