'use strict';

var unirest = require('unirest')
var KongaApiService = require('../services/KongaApiService')

var KongaApiController = {

    getConsumerCredentials : function(req,res) {
        unirest.get(sails.config.kong_admin_url + '/consumers/' + req.params.id + '/' + req.params.credential)
            .end(function (response) {
                if (response.error)  return res.kongError(response)
                return res.json(response.body.data)
        })
    },

    createConsumer : function(req,res) {
        KongaApiService.createConsumer(req,function(err,response){
            if(err) return res.kongError(err)
            return res.json(response)
        })
    }


};

module.exports = KongaApiController;
