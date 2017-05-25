'use strict';

var unirest = require('unirest');

/**
 * Authentication Controller
 *
 * This is merely meant as an example of how your Authentication controller should look. It currently
 * includes the minimum amount of functionality for the basics of Passport.js to work.
 */
var KongInfoController = {

    info: function(req, res) {
        console.log("sails.config.kong_admin_url", sails.config.kong_admin_url)
        var request = unirest.get(sails.config.kong_admin_url);
        if (sails.config.kong_admin_basic_auth_enabled) {
            request.auth(sails.config.kong_admin_username, sails.config.kong_admin_password, true)
        }
        request.end(function(response) {
            if (response.error) return res.negotiate(response.error)
            return res.json(response.body)
        })
    },

    status: function(req, res) {

        var request = unirest.get((req.query.kong_admin_url || sails.config.kong_admin_url) + "/status")
        if (sails.config.kong_admin_basic_auth_enabled) {
            request.auth(sails.config.kong_admin_username, sails.config.kong_admin_password, true)
        }
        request.end(function(response) {
            if (response.error) return res.negotiate(response.error)
            return res.json(response.body)
        })
    },

    cluster: function(req, res) {

        var request = unirest.get(sails.config.kong_admin_url + "/cluster")
        if (sails.config.kong_admin_basic_auth_enabled) {
            request.auth(sails.config.kong_admin_username, sails.config.kong_admin_password, true)
        }
        request.end(function(response) {
            if (response.error) return res.negotiate(response.error)
            return res.json(response.body)
        })
    },

    deleteCluster: function(req, res) {

        // ToDo
    }
};

module.exports = KongInfoController;