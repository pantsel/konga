'use strict';

var unirest = require("unirest")

var KongApiController = {
    add : function(req,res) {
        console.log(req.body)
        unirest.post(sails.config.kong_admin_url + '/apis')
            .send(req.body)
            .end(function(response){
                if(response.error) return  res.kongError(response)
                return res.json(response.body)
            })
    },
    retrieve : function(req,res) {
        unirest.get(sails.config.kong_admin_url + '/apis/'  + req.params.id)
            .end(function(response){
                if(response.error)  res.kongError(response)
                return res.json(response.body)
            })
    },

    list : function(req,res) {
        unirest.get(sails.config.kong_admin_url + '/apis')
            .end(function(response){
                if(response.error) return res.kongError(response)
                return res.json(response.body)
            })
    },

    update : function(req,res) {
        unirest.patch(sails.config.kong_admin_url + '/apis/'  + req.params.id)
            .send(req.body)
            .end(function(response){
                if(response.error) return res.kongError(response)
                return res.json(response.body)
            })
    },

    updateOrCreate : function(req,res) {
        unirest.put(sails.config.kong_admin_url + '/apis')
            .send(req.body)
            .end(function(response){
                if(response.error) return  res.kongError(response)
                return res.json(response.body)
            })
    },

    delete : function(req,res) {
        unirest.delete(sails.config.kong_admin_url + '/apis/'  + req.params.id)
            .end(function(response){
                if(response.error) return  res.kongError(response)
                return res.json(response.body)
            })
    }
};

module.exports = KongApiController;
