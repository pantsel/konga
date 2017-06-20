'use strict';

var _ = require('lodash');
var actionUtil = require('sails/lib/hooks/blueprints/actionUtil');

/**
 * Policy to set necessary update data to body. Note that this policy will also remove some body items.
 *
 * @param   {Request}   request     Request object
 * @param   {Response}  response    Response object
 * @param   {Function}  next        Callback function
 */
module.exports = function activeNodeData(request, response, next) {
  sails.log.verbose(__filename + ':' + __line + ' [Policy.activeNodeData() called]');


  // sails.config.kong_admin_url = request.headers['kong-admin-url'] || sails.config.kong_admin_url

  var c = actionUtil.parseCriteria(request)

  if(c.hasOwnProperty('or')){
    c['and'] = [{node_id : request.node_id}]
  }else{
    c['node_id'] = request.node_id
  }

  request.query.where = JSON.stringify(c)


  return  next()


};
