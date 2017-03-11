/**
 * Angular module for 'core' component. This component is divided to following logical components:
 *
 *  frontend.core.dependencies
 *  frontend.core.auth
 *  frontend.core.components
 *  frontend.core.directives
 *  frontend.core.error
 *  frontend.core.filters
 *  frontend.core.interceptors
 *  frontend.core.layout
 *  frontend.core.libraries
 *  frontend.core.models
 *  frontend.core.services
 */
(function() {
  'use strict';

  // Define frontend.core module
  angular.module('frontend.core', [
    'frontend.core.dependencies', // Note that this must be loaded first
    'frontend.core.auth',
    'frontend.core.components',
    'frontend.core.directives',
    'frontend.core.error',
    'frontend.core.filters',
    'frontend.core.interceptors',
    'frontend.core.layout',
    'frontend.core.libraries',
    'frontend.core.models',
    'frontend.core.services'
  ]);
}());
