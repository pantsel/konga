'use strict';

var unirest = require('unirest');

/**
 * Authentication Controller
 *
 * This is merely meant as an example of how your Authentication controller should look. It currently
 * includes the minimum amount of functionality for the basics of Passport.js to work.
 */
var KongInfoController = {
    info : function(req,res) {
        console.log("sails.config.kong_admin_url",sails.config.kong_admin_url)
        unirest.get(sails.config.kong_admin_url)
            .end(function(response){
                if(response.error) return res.negotiate(response.error)
                return res.json(response.body)
            })
    },
    status : function(req,res) {
        unirest.get(sails.config.kong_admin_url + "/status")
            .end(function(response){
                if(response.error) return res.negotiate(response.error)
                return res.json(response.body)
            })
    },

    cluster : function(req,res) {
        unirest.get(sails.config.kong_admin_url + "/cluster")
            .end(function(response){
                if(response.error) return res.negotiate(response.error)
                return res.json(response.body)
            })
    },

    deleteCluster : function(req,res) {
        // ToDo
    }
};

module.exports = KongInfoController;
