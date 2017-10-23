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

    // If kong-admin-url is set in headers or qs, use that, else get node from user

    if(request.headers['kong-admin-url'] || request.query.kong_admin_url) {
        // sails.config.kong_admin_url = request.headers['kong-admin-url'] || request.query.kong_admin_url
        request.node_id = request.headers['kong-admin-url'] || request.query.kong_admin_url
        request.kong_api_key = request.headers['kong_api_key'] || request.query.kong_api_key
        return  next()
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
