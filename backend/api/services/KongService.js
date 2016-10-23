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
    retrieve: function (req, res) {
        unirest.get(sails.config.kong_admin_url + req.url.replace('/kong',''))
            .end(function (response) {
                if (response.error)  return res.kongError(response)
                return res.json(response.body)
            })
    },

    list: function (req, res) {
        unirest.get(sails.config.kong_admin_url + req.url.replace('/kong',''))
            .end(function (response) {
                if (response.error) return res.kongError(response)
                return res.json(response.body)
            })
    },

    update: function (req, res) {
        unirest.patch(sails.config.kong_admin_url + req.url.replace('/kong',''))
            .send(req.body)
            .end(function (response) {
                if (response.error) return res.kongError(response)
                return res.json(response.body)
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
    }
}

module.exports = KongService
