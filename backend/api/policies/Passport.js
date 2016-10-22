'use strict';

var passport = require('passport');

/**
 * Policy for Sails that initializes Passport.js to use.
 *
 * @param   {Request}   request     Request object
 * @param   {Response}  response    Response object
 * @param   {Function}  next        Callback function
 */
module.exports = function(request, response, next) {
  sails.log.verbose(__filename + ':' + __line + ' [Policy.Passport() called]');

  // Initialize Passport
  passport.initialize()(request, response, next);
};
