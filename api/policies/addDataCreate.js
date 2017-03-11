'use strict';

/**
 * Policy to set necessary create data to body.
 *
 * @param   {Request}   request     Request object
 * @param   {Response}  response    Response object
 * @param   {Function}  next        Callback function
 */
module.exports = function addDataCreate(request, response, next) {
  sails.log.verbose(__filename + ':' + __line + ' [Policy.addDataCreate() called]');

  if (request.token) {
    request.body.createdUser = request.token;
    request.body.updatedUser = request.token;

    next();
  } else {
    var error = new Error();

    error.message = 'Request token not present.';
    error.status = 403;

    next(error);
  }
};
