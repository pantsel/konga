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

    if(request.headers['connection-id'] || request.query.connection_id) {

        sails.log.debug("Policy:dynamicNode", "`connection-id` is defined.");

        sails.models.kongnode.findOne(request.headers['connection-id'] || request.query.connection_id)
            .exec(function(err,node) {
                if (err) return next(err);
                if (!node) return response.notFound({
                    message: "connection not found"
                })

                request.connection = node;

                return  next();
            });

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
                request.connection = user.node;
                return  next();
            }else{
                return response.badRequest({
                    message : "No connection is selected. Please activate a connection in settings"
                });
            }
        });
    }

};
