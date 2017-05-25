'use strict';

var unirest = require("unirest")
var _ = require('lodash');
var KongPluginService = require('../services/KongPluginService')

var KongPluginController  = _.merge(_.cloneDeep(require('../base/KongController')), {

    create : function(req,res) {
        return KongPluginService.create(req,res)

    },

    retrieveEnabled : function(req,res) {
        var request =  unirest.get(sails.config.kong_admin_url + '/plugins/enabled/');
           if (sails.config.kong_admin_basic_auth_enabled) {
            request.auth(sails.config.kong_admin_username, sails.config.kong_admin_password, true);
        }
        
        
            request.end(function(response){
                if(response.error) return res.kongError(response)
                return res.json(response.body)
            })
    },

    retrieveSchema : function(req,res) {
         var request = unirest.get(sails.config.kong_admin_url + '/plugins/schema/' + req.params.plugin);
            if (sails.config.kong_admin_basic_auth_enabled) {
            request.auth(sails.config.kong_admin_username, sails.config.kong_admin_password, true);
        }
        
        
            request.end(function(response){
                if(response.error) return res.kongError(response)
                return res.json(response.body)
            })
    },

    listApi : function(req,res) {
         var request = unirest.get(sails.config.kong_admin_url + '/apis/' + req.params.api + '/plugins/');
            if (sails.config.kong_admin_basic_auth_enabled) {
            request.auth(sails.config.kong_admin_username, sails.config.kong_admin_password, true);
        }
        
        
            request.end(function(response){
                if(response.error) return res.kongError(response)
                return res.json(response.body)
            })
    },
});

module.exports = KongPluginController;
