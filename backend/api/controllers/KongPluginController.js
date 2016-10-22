'use strict';

var unirest = require("unirest")


var KongPluginController = {
    add : function(req,res) {
        unirest.post(sails.config.kong_admin_url + '/apis/' + req.params.api + '/plugins/')
            .send(req.body)
            .end(function(response){
                if(response.error) return res.kongError(response)
                return res.json(response.body)
            })
    },
    retrieve : function(req,res) {
        unirest.get(sails.config.kong_admin_url + "/pugins/" + req.params.id)
            .end(function(response){
                if(response.error) return res.kongError(response)
                return res.json(response.body)
            })
    },

    retrieveEnabled : function(req,res) {
        unirest.get(sails.config.kong_admin_url + '/plugins/enabled/')
            .end(function(response){
                if(response.error) return res.kongError(response)
                return res.json(response.body)
            })
    },

    retrieveSchema : function(req,res) {
        unirest.get(sails.config.kong_admin_url + '/plugins/shema/' + req.params.plugin)
            .end(function(response){
                if(response.error) return res.kongError(response)
                return res.json(response.body)
            })
    },

    list : function(req,res) {
        unirest.get(sails.config.kong_admin_url + '/plugins/')
            .end(function(response){
                if(response.error) return res.kongError(response)
                return res.json(response.body)
            })
    },

    listApi : function(req,res) {
        unirest.get(sails.config.kong_admin_url + '/apis/' + req.params.api + '/plugins/')
            .end(function(response){
                if(response.error) return res.kongError(response)
                return res.json(response.body)
            })
    },

    update : function(req,res) {
        unirest.patch(sails.config.kong_admin_url + "/apis/" + req.params.api + '/plugins/' + req.params.id)
            .send(req.body)
            .end(function(response){
                if(response.error) return res.kongError(response)
                return res.json(response.body)
            })
    },

    updateOrCreate : function(req,res) {
        unirest.put(sails.config.kong_admin_url + "/apis/" + req.params.api + '/plugins/')
            .send(req.body)
            .end(function(response){
                if(response.error) return res.kongError(response)
                return res.json(response.body)
            })
    },

    delete : function(req,res) {
        unirest.delete(sails.config.kong_admin_url + "/apis/" + req.params.api + '/plugins/' + req.params.id)
            .end(function(response){
                if(response.error) return res.kongError(response)
                return res.json(response.body)
            })
    }
};

module.exports = KongPluginController;
