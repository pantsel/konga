'use strict';

var unirest = require("unirest")
var async = require('async')
var fs = require('fs')

var KongService = {
    create: function (req, res) {

        req.file('file').upload(function (err, uploadFiles) {


            console.log(req.body)
            var fds = []
            uploadFiles.forEach(function(file){
                console.log(file.fd);
                fds.push(fs.readFileSync(file.fd))
            })

            unirest.post(sails.config.kong_admin_url + req.url.replace('/kong',''))
                .headers({'Content-Type': 'multipart/form-data'})
                .field('name', req.body.name)
                .field('config.only_https', req.body['config.only_https'] || false)
                .field('config.accept_http_if_already_terminated', req.body['config.accept_http_if_already_terminated'] || false)
                .attach('config.cert', fds[0])
                .attach('config.key', fds[1])
                .end(function (response) {
                    if (response.error)  return res.kongError(response)
                    return res.json(response.body)
                });


        });




        //unirest.post(sails.config.kong_admin_url + req.url.replace('/kong',''))
        //    .send(req.body)
        //    .end(function (response) {
        //        if (response.error)  return res.kongError(response)
        //        return res.json(response.body)
        //    })
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
