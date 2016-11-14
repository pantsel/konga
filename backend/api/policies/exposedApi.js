'use strict';

var _ = require('lodash');

/**
 * Policy to set necessary update data to body. Note that this policy will also remove some body items.
 *
 * @param   {Request}   request     Request object
 * @param   {Response}  response    Response object
 * @param   {Function}  next        Callback function
 */
module.exports = function exposedApi(request, response, next) {
  sails.log.verbose(__filename + ':' + __line + ' [Policy.exposedApi() called]');


  if(!sails.config.expose_api) {
    var error = new Error();
    error.message = 'Forbidden'
    error.status = 403;
    return  next(error)
  }

  return  next()

};
