'use strict';

/**
 * 403 (Forbidden) Handler
 *
 * Usage:
 * return res.forbidden();
 * return res.forbidden(err);
 * return res.forbidden(err, 'some/specific/forbidden/view');
 *
 * e.g.:
 * ```
 * return res.forbidden('Access denied.');
 * ```
 *
 * @param   {{}}  data    Data for response
 * @param   {{}}  options Response options
 * @returns {*}
 */
module.exports = function forbidden(data, options) {
  // Get access to `req`, `res`, & `sails`
  var request = this.req;
  var response = this.res;
  var sails = request._sails;

  /**
   * If second argument is a string, we take that to mean it refers to a view.
   * If it was omitted, use an empty object (`{}`)
   */
  options = (typeof options === 'string') ? { view: options } : options || {};

  // Set status code
  response.status(403);

  // Log error to console
  if (data !== undefined) {
    sails.log.verbose('Sending 403 ("Forbidden") response: \n', data);
  } else {
    sails.log.verbose('Sending 403 ("Forbidden") response');
  }

  // Backend will always response JSON
  return response.jsonx(data);
};
