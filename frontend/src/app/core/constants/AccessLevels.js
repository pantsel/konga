/**
 * Frontend application access level constant definitions. These are used to to restrict access to certain routes in
 * application.
 *
 * Note that actual access check is done by currently signed in user.
 */
(function() {
  'use strict';

  angular.module('frontend')
    .constant('AccessLevels', {
      anon: 0,
      user: 1,
      admin: 2
    })
  ;
}());
