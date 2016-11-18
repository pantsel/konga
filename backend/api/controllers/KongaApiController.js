'use strict';

var unirest = require('unirest')
var KongaApiService = require('../services/KongaApiService')
var ConsumerCredentialsService = require('../services/ConsumerCredentialsService')
var ConsumerService = require('../services/ConsumerService')

var KongaApiController = {

    /**
     * List all credentials assigned to the specified consumer
     * @param req
     * @param res
     */
    listConsumerCredentials : function(req,res) {

        ConsumerCredentialsService.listCredentials(req.params.id,function(err,result){
            if(err) return res.negotiate(err)
            return res.json(result)
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
     * Updates a Consumer
     * @param req
     * @param res
     */
    updateConsumer : function(req,res) {
        KongaApiService.consumers.update(req.params.id,req.body,function(err,response){
            if(err) return res.kongError(err)
            ConsumerService.sync(function(err,ok){}) // Fire and forget
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
