'use strict';

var unirest = require("unirest")
var async = require('async')
var fs = require('fs')
var path = require('path')
var _ = require('lodash')
var KongService = require('./KongService')


var KongPluginService = _.merge(_.cloneDeep(require('./KongService')), {

    makeSelfSignedCerts : function makeSelfSignedCerts(cb) {
        var fds = []
        var exec = require('child_process').exec;
        var cert_path = path.join(__dirname,"..","..",'.tmp')
        var cmd = 'cd ' + cert_path + ' && openssl genrsa -out certificate.key 2048';
        var key
        var cert
        exec(cmd, function(error, stdout, stderr) {
            key = fs.readFileSync(path.join(__dirname,"..","..",'.tmp/certificate.key'))
            fds.push(key)
            cmd = 'cd ' + cert_path + ' && openssl req -new -x509 -key certificate.key -out certificate.cert -days 3650 -subj /CN=cert';
            exec(cmd, function(error, stdout, stderr) {
                cert = fs.readFileSync(path.join(__dirname,"..","..",'.tmp/certificate.cert'))
                fds.push(cert)
                cb(null,fds)
            });
        });
    },

    addDynamicSSLPlugin : function(fds,req, res) {
        return unirest.post(req.node_id + req.url.replace('/kong',''))
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
    },

    addCertificates : function(fds,req, res) {
        var request = unirest.post(req.node_id + req.url.replace('/kong',''))

        if(req.kong_api_key) {
            request.headers({'apikey': req.kong_api_key})
        }
        request.field('snis', req.body['snis'] || '')
        request.attach('cert', fds[0])
        request.attach('key', fds[1])
        return  request.end(function (response) {
                if (response.error)  return res.kongError(response)
                return res.json(response.body)
            });
    },

    updateCertificates : function(fds,req, res) {
        var request = unirest.patch(req.node_id + req.url.replace('/kong',''))
        if(req.kong_api_key) {
            request.headers({'apikey': req.kong_api_key})
        }

        request.field('snis', req.body['snis'] || '')
        if(fds[0]) request.attach('cert', fds[0])
        if(fds[1]) request.attach('key', fds[1])

        return request.end(function (response) {
                if (response.error)  return res.kongError(response)
                return res.json(response.body)
            });

    },

    addPlugin : function(req,res) {
        return unirest.post(req.node_id + req.url.replace('/kong',''))
            .send(req.body)
            .end(function (response) {
                if (response.error)  return res.kongError(response)
                return res.json(response.body)
            })
    },

    createCb: function (req, res, cb) {

        unirest.post(req.node_id + req.url.replace('/kong',''))
            .send(req.body)
            .end(function (response) {
                if (response.error)  return cb(response)
                return cb(null,response.body)
            })
    },

    create: function (req, res) {

        if(req.body.name === 'ssl') {
            req.file('file').upload(function (err, uploadFiles) {

                var fds = []

                if(!uploadFiles.length) {
                    // If no files where uploaded
                    // generate self-signed certs
                    KongPluginService.makeSelfSignedCerts(function(err,certs){
                        fds = certs
                        return KongPluginService.addDynamicSSLPlugin(fds,req,res)
                    })
                }else{
                    uploadFiles.forEach(function(file){
                        fds.push(fs.readFileSync(file.fd))
                    })
                    return KongPluginService.addDynamicSSLPlugin(fds,req,res)
                }
            });
        }else{
            return KongPluginService.addPlugin(req,res)
        }
    },

    retrieve: function (req, res) {
        unirest.get(req.node_id + req.url.replace('/kong',''))
            .end(function (response) {
                if (response.error)  return res.kongError(response)
                return res.json(response.body)
            })
    },

    list: function (req, res) {
        unirest.get(req.node_id + req.url.replace('/kong',''))
            .end(function (response) {
                if (response.error) return res.kongError(response)
                return res.json(response.body)
            })
    },

    update: function (req, res) {
        unirest.patch(req.node_id + req.url.replace('/kong',''))
            .send(req.body)
            .end(function (response) {
                if (response.error) return res.kongError(response)
                return res.json(response.body)
            })
    },

    updateCb: function (req, res,cb) {
        unirest.patch(req.node_id + req.url.replace('/kong',''))
            .send(req.body)
            .end(function (response) {
                if (response.error) return cb(response)
                return cb(null,response.body)
            })
    },

    updateOrCreate: function (req, res) {
        unirest.put(req.node_id + req.url.replace('/kong',''))
            .send(req.body)
            .end(function (response) {
                if (response.error) return res.kongError(response)
                return res.json(response.body)
            })
    },

    delete: function (req, res) {
        unirest.delete(req.node_id + req.url.replace('/kong',''))
            .end(function (response) {
                if (response.error) return res.kongError(response)
                return res.json(response.body)
            })
    },

    deleteCb: function (req, res,cb) {
        unirest.delete(req.node_id + req.url.replace('/kong',''))
            .end(function (response) {
                if (response.error) return cb(response)
                return cb(null,response.body)
            })
    }
})

module.exports = KongPluginService
