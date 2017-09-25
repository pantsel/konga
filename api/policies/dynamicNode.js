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



    // If kong-admin-url is set in headers or qs, use that, else get node from user

    if(request.headers['connection'] || request.query.connection) {
        //request.node_id = request.headers['kong-admin-url'] || request.query.kong_admin_url
        //request.kong_api_key = request.headers['kong_api_key'] || request.query.kong_api_key
        //return  next()

        var connectionId = request.headers['connectionId'] || request.query.connectionId;

        sails.models.kongnode.find(connectionId)
            .exec(function(err,connection){
                if(err) return next(err);
                if(!connection) return response.notFound({
                    message : "user not found"
                })

                request.kong_api_key = connection.kong_api_key
                request.node_id = connection.kong_admin_url
                return  next()
            })
    }else{
        // Get the default node from user
        sails.models.user.findOne({
            id:request.token
        }).populate('node').exec(function(err,user) {
            if(err) return next(err);
            if(!user) return response.notFound({
                message : "user not found"
            })

            if(user.node) {
                // sails.config.kong_admin_url = user.node.kong_admin_url
                request.kong_api_key = user.node.kong_api_key
                request.node_id = user.node.kong_admin_url
                return  next()
            }else{
                return response.badRequest({
                    message : "No connection is selected. Please activate a connection in settings"
                })
            }
        })
    }

};
