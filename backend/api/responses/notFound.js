'use strict';

/**
 * 404 (Not Found) Handler
 *
 * Usage:
 * return res.notFound();
 * return res.notFound(err);
 * return res.notFound(err, 'some/specific/notfound/view');
 *
 * e.g.:
 * ```
 * return res.notFound();
 * ```
 *
 * NOTE:
 * If a request doesn't match any explicit routes (i.e. `config/routes.js`)
 * or route blueprints (i.e. "shadow routes", Sails will call `res.notFound()`
 * automatically.
 *
 * @param   {{}}  data    Data for response
 * @param   {{}}  options Response options
 * @returns {*}
 */
module.exports = function notFound(data, options) {
  // Get access to `req`, `res`, & `sails`
  var request = this.req;
  var response = this.res;
  var sails = request._sails;

  /**
   * If second argument is a string, we take that to mean it refers to a view.
   * If it was omitted, use an empty object (`{}`)
   */
  options = (typeof options === 'string') ? {view: options} : options || {};

  // Set status code
  response.status(404);

  // Log error to console
  if (data !== undefined) {
    sails.log.verbose('Sending 404 ("Not Found") response: \n', data);
  } else {
    sails.log.verbose('Sending 404 ("Not Found") response');
  }

  // Backend will always response JSON
  return response.jsonx(data);
};
