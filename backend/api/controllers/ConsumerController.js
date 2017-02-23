'use strict';
var _ = require('lodash')

/**
 * UserController
 *
 * @description :: Server-side logic for managing Users
 * @help        :: See http://links.sailsjs.org/docs/controllers
 */
module.exports = {
    /**
     * Proxy requests to native Kong Admin API
     * @param req
     * @param res
     */
    proxy : function(req,res) {
        global.$proxy.web(req, res, {
            target: sails.config.kong_admin_url
        });
    },

};
