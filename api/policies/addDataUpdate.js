'use strict';

var _ = require('lodash');

/**
 * Policy to set necessary update data to body. Note that this policy will also remove some body items.
 *
 * @param   {Request}   request     Request object
 * @param   {Response}  response    Response object
 * @param   {Function}  next        Callback function
 */
module.exports = function addDataUpdate(request, response, next) {
  sails.log.verbose(__filename + ':' + __line + ' [Policy.addDataUpdate() called]');
  if (request.token) {
    var itemsToRemove = [
      'id',
      'createdUser',
      'updatedUser',
      'createdAt',
      'updatedAt'
    ];

    // Remove not needed attributes from body
    _.forEach(itemsToRemove, function iterator(item) {
      delete request.body[item];
    });

    request.body.updatedUser = request.token;

    next();
  } else {
    var error = new Error();

    error.message = 'Request token not present.';
    error.status = 403;

    next(error);
  }
};
