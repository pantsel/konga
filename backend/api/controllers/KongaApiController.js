'use strict';

var unirest = require('unirest')
var KongaApiService = require('../services/KongaApiService')
var ConsumerService = require('../services/ConsumerService')

var KongaApiController = {

    getConsumerCredentials : function(req,res) {
        unirest.get(sails.config.kong_admin_url + '/consumers/' + req.params.id + '/' + req.params.credential)
            .end(function (response) {
                if (response.error)  return res.kongError(response)
                return res.json(response.body.data)
        })
    },

    /**
     * Creates a consumer and with associated groups and authorizations
     * @param req
     * @param res
     */
    createConsumer : function(req,res) {
        KongaApiService.consumers.create(req.body,function(err,response){
            if(err) return res.kongError(err)

            // Sync consumers
            //ConsumerService.sync(function(err,ok){
            //    // Fire and forget
            //})

            return res.json(response)
        })
    },

    /**
     * Registers or updates an already registered api and it's associated plugins
     * @param req
     * @param res
     */
    registerApi : function(req,res) {
        KongaApiService.apis.register(req.body,function(err,response){
            if(err) return res.kongError(err)
            return res.json(response)
        })
    }


};

module.exports = KongaApiController;
