'use strict';

var KongService = require('../services/KongService')
var unirest = require("unirest")

module.exports = {

    create : function(req,res) {
        return KongService.create(req,res)
    },
    retrieve : function(req,res) {
        return KongService.retrieve(req,res)
    },

    list : function(req,res) {
        return KongService.list(req,res)
    },

    update : function(req,res) {
        return KongService.update(req,res)
    },

    updateOrCreate : function(req,res) {
        return KongService.updateOrCreate(req,res)
    },

    delete : function(req,res) {
        return KongService.delete(req,res)
    }
};