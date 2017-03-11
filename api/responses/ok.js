'use strict';

/**
 * 200 (OK) Response
 *
 * Usage:
 * return res.ok();
 * return res.ok(data);
 * return res.ok(data, 'auth/login');
 *
 * @param   {{}}  data    Data for response
 * @param   {{}}  options Response options
 * @returns {*}
 */
module.exports = function sendOK(data, options) {
  // Get access to `req`, `res`, & `sails`
  var request = this.req;
  var response = this.res;
  var sails = request._sails;

  /**
   * If second argument is a string, we take that to mean it refers to a view.
   * If it was omitted, use an empty object (`{}`)
   */
  options = (typeof options === 'string') ? {view: options} : options || {};

  sails.log.silly('res.ok() :: Sending 200 ("OK") response');

  // Set status code
  response.status(200);

  // Backend will always response JSON
  return response.jsonx(data);
};
