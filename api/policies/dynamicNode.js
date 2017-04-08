'use strict';

var _ = require('lodash');

/**
 * Policy to set necessary update data to body. Note that this policy will also remove some body items.
 *
 * @param   {Request}   request     Request object
 * @param   {Response}  response    Response object
 * @param   {Function}  next        Callback function
 */
module.exports = function dynamicNode(request, response, next) {
  sails.log.debug(__filename + ':' + __line + ' [Policy.dynamicNode() called]',request.headers['kong-admin-url']);


  if(!request.headers['kong-admin-url']) return response.badRequest({
    message : "No connection is selected. Please activate a connection in settings"
  })

  sails.config.kong_admin_url = request.headers['kong-admin-url']
  request.node_id = sails.config.kong_admin_url
  return  next()

};
