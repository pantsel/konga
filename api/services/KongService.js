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

    createFromEndpointCb: function (endpoint,data, cb) {

        if(data.config) {
            Object.keys(data.config).forEach(function(key){
                data["config." + key] = data.config[key]
            })

            delete data.config
        }

        unirest.post(sails.config.kong_admin_url + endpoint)
            .send(data)
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

    listAllCb: function (req, endpoint, cb) {
        var getData = function (previousData,url) {
            unirest.get(url)
                .end(function (response) {
                    if (response.error) return cb(response)
                    var data = previousData.concat(response.body.data);
                    if (response.body.next) {
                        getData(data,response.body.next);
                    }
                    else {
                        response.body.data = data;
                        return cb(null,response.body)
                    }
                })
        };
        getData([],sails.config.kong_admin_url  + endpoint);
    },


    list: function (req, res) {
        var getData = function (previousData,url) {
            unirest.get(url)
                .end(function (response) {
                    if (response.error) return res.kongError(response)
                    var apis = previousData.concat(response.body.data);
                    if (response.body.next) {
                        getData(apis,response.body.next);
                    }
                    else {
                        response.body.data = apis;
                        return res.json(response.body)
                    }
                })
        };
        getData([],sails.config.kong_admin_url + req.url.replace('/kong',''));
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
