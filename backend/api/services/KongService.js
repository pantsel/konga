'use strict';

var unirest = require("unirest")


var KongService = {

    create: function (req, res) {

        unirest.post(sails.config.kong_admin_url + req.url.replace('/kong',''))
            .send(req.body)
            .end(function (response) {
                if (response.error)  return res.kongError(response)
                return res.json(response.body)
            })
    },

    createCb: function (req, res, cb) {

        unirest.post(sails.config.kong_admin_url + req.url.replace('/kong',''))
            .send(req.body)
            .end(function (response) {
                if (response.error)  return cb(response)
                return cb(null,response.body)
            })
    },


    retrieve: function (req, res) {
        unirest.get(sails.config.kong_admin_url + req.url.replace('/kong',''))
            .end(function (response) {
                if (response.error)  return res.kongError(response)
                return res.json(response.body)
            })
    },

    list: function (req, res) {
        var getAPIs = function (previousAPIs,url) {
            unirest.get(url)
                .end(function (response) {
                    if (response.error) return res.kongError(response)
                    var apis = previousAPIs.concat(response.body.data);
                    if (response.body.next) {
                        getAPIs(apis,response.body.next);
                    }
                    else {
                        response.body.data = apis;
                        return res.json(response.body)
                    }
                })
        };
        getAPIs([],sails.config.kong_admin_url + req.url.replace('/kong',''));
    },

    update: function (req, res) {
        unirest.patch(sails.config.kong_admin_url + req.url.replace('/kong',''))
            .send(req.body)
            .end(function (response) {
                if (response.error) return res.kongError(response)
                return res.json(response.body)
            })
    },

    updateCb: function (req, res,cb) {
        unirest.patch(sails.config.kong_admin_url + req.url.replace('/kong',''))
            .send(req.body)
            .end(function (response) {
                if (response.error) return cb(response)
                return cb(null,response.body)
            })
    },

    updateOrCreate: function (req, res) {
        unirest.put(sails.config.kong_admin_url + req.url.replace('/kong',''))
            .send(req.body)
            .end(function (response) {
                if (response.error) return res.kongError(response)
                return res.json(response.body)
            })
    },

    delete: function (req, res) {
        unirest.delete(sails.config.kong_admin_url + req.url.replace('/kong',''))
            .end(function (response) {
                if (response.error) return res.kongError(response)
                return res.json(response.body)
            })
    },

    deleteCb: function (req, res,cb) {
        unirest.delete(sails.config.kong_admin_url + req.url.replace('/kong',''))
            .end(function (response) {
                if (response.error) return cb(response)
                return cb(null,response.body)
            })
    }
}

module.exports = KongService
