'use strict';

var unirest = require('unirest');
var KongGroup = require("../models/KongGroup")


var KongConsumerController = {
    create : function(req,res) {
        unirest.post(sails.config.kong_admin_url + '/consumers')
            .send({
                username : req.body.username,
                custom_id : req.body.custom_id
            })
            .end(function(response){
                if(response.error) return res.kongError(response)
                return res.json(response.body)
            })
    },
    retrieve : function(req,res) {
        unirest.get(sails.config.kong_admin_url + '/consumers' + "/" + req.params.id)
            .end(function(response){
                if(response.error) return  res.kongError(response)
                return res.json(response.body)
            })
    },

    list : function(req,res) {
        unirest.get(sails.config.kong_admin_url + '/consumers')
            .send(req.query)
            .end(function(response){
                if(response.error) return  res.kongError(response)
                return res.json(response.body)
            })
    },

    update : function(req,res) {
        unirest.patch(sails.config.kong_admin_url + '/consumers' + "/" + req.params.id)
            .send(req.body)
            .end(function(response){
                if(response.error) return res.kongError(response)
                return res.json(response.body)
            })
    },

    updateOrCreate : function(req,res) {
        unirest.put(sails.config.kong_admin_url + '/consumers')
            .send(req.body)
            .end(function(response){
                if(response.error) return  res.kongError(response)
                return res.json(response.body)
            })
    },

    delete : function(req,res) {
        unirest.delete(sails.config.kong_admin_url + '/consumers' + "/" + req.params.id)
            .end(function(response){
                if(response.error) return  res.kongError(response)
                return res.json(response.body)
            })
    },

    retrieveJWT : function(req,res) {
        unirest.get(sails.config.kong_admin_url + '/consumers' + "/" + req.params.id + "/jwt")
            .end(function(response){
                if(response.error) return  res.kongError(response)
                return res.json(response.body)
            })
    },

    createJWT : function(req,res) {
        unirest.post(sails.config.kong_admin_url + '/consumers' + "/" + req.params.id + "/jwt")
            .send(req.body)
            .end(function(response){
                if(response.error) return  res.kongError(response)
                return res.json(response.body)
            })
    },

    deleteJWT : function(req,res) {
        unirest.delete(sails.config.kong_admin_url + '/consumers' + "/" + req.params.id + "/jwt/" + req.params.jwtId)
            .end(function(response){
                if(response.error) return  res.kongError(response)
                return res.json(response.body)
            })
    },


    retrieveKeys : function(req,res) {
        unirest.get(sails.config.kong_admin_url + '/consumers' + "/" + req.params.id + "/key-auth")
            .end(function(response){
                if(response.error) return  res.kongError(response)
                return res.json(response.body)
            })
    },

    createKey : function(req,res) {
        unirest.post(sails.config.kong_admin_url + '/consumers' + "/" + req.params.id + "/key-auth")
            .send({
                key : req.body.key
            })
            .end(function(response){
                if(response.error) return  res.kongError(response)
                return res.json(response.body)
            })
    },

    deleteKey : function(req,res) {
        unirest.delete(sails.config.kong_admin_url + '/consumers' + "/" + req.params.id + "/key-auth/" + req.params.keyId)
            .end(function(response){
                if(response.error) return  res.kongError(response)
                return res.json(response.body)
            })
    },



    retrieveBasicAuthCredentials : function(req,res) {
        unirest.get(sails.config.kong_admin_url + '/consumers' + "/" + req.params.id + "/basic-auth")
            .end(function(response){
                if(response.error) return res.kongError(response)
                return res.json(response.body)
            })
    },

    createBasicAuthCredentials : function(req,res) {
        unirest.post(sails.config.kong_admin_url + '/consumers' + "/" + req.params.id + "/basic-auth")
            .send(req.body)
            .end(function(response){
                if(response.error) return res.kongError(response)
                return res.json(response.body)
            })
    },

    deleteBasicAuthCredentials : function(req,res) {
        unirest.delete(sails.config.kong_admin_url + '/consumers' + "/" + req.params.id + "/basic-auth/" + req.params.credentialId)
            .end(function(response){
                if(response.error) return res.kongError(response)
                return res.json(response.body)
            })
    },


    /**
     * ---------------------------------------------------------------------
     * HMAC Auth
     * ---------------------------------------------------------------------
     */

    retrieveHMACAuthCredentials : function(req,res) {
        unirest.get(sails.config.kong_admin_url + '/consumers' + "/" + req.params.id + "/hmac-auth")
            .end(function(response){
                if(response.error) return res.kongError(response);
                return res.json(response.body)
            })
    },

    createHMACAuthCredentials : function(req,res) {
        unirest.post(sails.config.kong_admin_url + '/consumers' + "/" + req.params.id + "/hmac-auth")
            .send(req.body)
            .end(function(response){
                if(response.error) return res.kongError(response);
                return res.json(response.body)
            })
    },

    deleteHMACAuthCredentials : function(req,res) {
        unirest.delete(sails.config.kong_admin_url + '/consumers' + "/" + req.params.id + "/hmac-auth/" + req.params.credentialId)
            .end(function(response){
                if(response.error) return res.kongError(response);
                return res.json(response.body)
            })
    },


    addAcl : function(req,res) {
        unirest.post(sails.config.kong_admin_url + '/consumers' + "/" + req.params.id + "/acls")
            .send({
                group : req.body.group
            })
            .end(function(response){
                if(response.error) return res.kongError(response);
                return res.json(response.body)
            })
    },

    retrieveAcls : function(req,res) {
        unirest.get(sails.config.kong_admin_url + '/consumers' + "/" + req.params.id + "/acls")
            .end(function(response){
                if(response.error) return res.kongError(response);
                sails.models.konggroup.find()
                    .exec(function(err,groups){
                        if(err) return res.json(500, {customMessage: err.message});

                        groups.forEach(function(group){
                            response.body.data.forEach(function(acl){

                                if(group.name == acl.group) {
                                    console.log("group.name",group.name)
                                    console.log("acl.group",acl.group)
                                    group['added'] = true
                                    group['kong_group_id'] = acl.id
                                }
                            })
                        })

                        return res.json(groups)
                    })
            })
    },

    deleteAcl : function(req,res) {
        unirest.delete(sails.config.kong_admin_url + '/consumers' + "/" + req.params.id + "/acls/" + req.params.aclId)
            .end(function(response){
                if(response.error) return res.kongError(response);
                return res.json(response.body)
            })
    }
};

module.exports = KongConsumerController;
