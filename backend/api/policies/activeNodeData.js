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

  sails.models.kongnode.findOne({
    active:true
  }).exec(function afterwards(err, node){
    if (err) return next(err)
    if(!node) {
      var error = new Error();
      error.message = 'Unable to find a node to connect'
      error.code = 'E_NODE_UNDEFINED'
      error.status = 500;
      return  next(error)
    }

    var c = actionUtil.parseCriteria(request)

    if(c.hasOwnProperty('or')){
      c['and'] = [{node_id : node.id}]
    }else{
      c['where'] = {node_id : node.id}
    }

    request.query.where = JSON.stringify(c)

    return  next()
  })


};
