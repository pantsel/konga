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


    richList : function(req,res) {
        var _this = this;
        unirest.get(req.node_id + '/plugins/enabled')
            .end(function (response) {
                if (response.error) return res.kongError(response)

                console.log("*******************************",response.body)
                var enabledPlugins = response.body.enabled_plugins;

                return res.json(_this.makeGroups(enabledPlugins))

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
    },

    makeGroups : function(_enabledPlugins) {

        var _groups = this.groups();
        var enabledPlugins = _.clone(_enabledPlugins);

        _groups.forEach(function(group) {
            Object.keys(group.plugins).forEach(function (key) {
                var index = enabledPlugins.indexOf(key);
                if(index > -1) {
                    group.plugins[key].enabled = true; // Mark plugin as enabled so it will be shown in the list
                    enabledPlugins.splice(index, 1); // Remove found plugin from array

                }
            })

        })

        // If there are any enabledPlugins left,
        // add them to the custom plugins group
        if(enabledPlugins.length) {
            enabledPlugins.forEach(function(plugin) {
                _groups[_groups.length - 1].plugins[plugin] = {}
            })
        }

        return _groups;

    },

    groups : function() {
        return [
            {
                name: "Authentication",
                description: "Protect your services with an authentication layer",
                icon: "mdi-account-outline",
                plugins: {
                    "basic-auth": {
                        description: "Add Basic Authentication to your APIs"
                    },
                    "key-auth": {
                        description: "Add a key authentication to your APIs"
                    },
                    "oauth2": {
                        description: "Add an OAuth 2.0 authentication to your APIs"
                    },
                    "hmac-auth": {
                        description: "Add HMAC Authentication to your APIs"
                    },
                    "jwt": {
                        description: "Verify and authenticate JSON Web Tokens"
                    },
                    "ldap-auth": {
                        description: "Integrate Kong with a LDAP server"
                    },
                }
            },
            {
                name: "Security",
                icon: "mdi-security",
                description: "Protect your services with additional security layers",
                plugins: {
                    "acl": {
                        description: "Control which consumers can access APIs"
                    },
                    "cors": {
                        description: "Allow developers to make requests from the browser"
                    },
                    "ssl": {
                        description: "Add an SSL certificate for an underlying service"
                    },
                    "ip-restriction": {
                        description: "Whitelist or blacklist IPs that can make requests"
                    },
                    "bot-detection": {
                        description: "Detects and blocks bots or custom clients"
                    }
                }
            },
            {
                name: "Traffic Control",
                icon: "mdi-traffic-light",
                description: "Manage, throttle and restrict inbound and outbound API traffic",
                plugins: {
                    "rate-limiting": {
                        description: "Rate-limit how many HTTP requests a developer can make"
                    },
                    "response-ratelimiting": {
                        description: "Rate-Limiting based on a custom response header value"
                    },
                    "request-size-limiting": {
                        description: "Block requests with bodies greater than a specific size"
                    },
                    "request-termination": {
                        description: "This plugin terminates incoming requests with a specified status code and message. This allows to (temporarily) block an API or Consumer."
                    },
                }
            },
            {
                name: "Serverless",
                description: "Invoke serverless functions in combination with other plugins:",
                icon: "mdi-cloud-sync",
                plugins: {
                    "aws-lambda": {
                        description: "Invoke an AWS Lambda function from Kong. It can be used in combination with other request plugins to secure, manage or extend the function."
                    }
                }
            },
            {
                name: "Analytics & Monitoring",
                icon: "mdi-chart-bar",
                description: "Visualize, inspect and monitor APIs and microservices traffic",
                plugins: {
                    "galileo": {
                        description: "Business Intelligence Platform for APIs"
                    },
                    "datadog": {
                        description: "Visualize API metrics on Datadog"
                    },
                    "runscope": {
                        description: "API Performance Testing and Monitoring"
                    },

                }
            },
            {
                name: "Transformations",
                icon: "mdi-nfc-tap",
                description: "Transform request and responses on the fly on Kong",
                plugins: {
                    "request-transformer": {
                        description: "Modify the request before hitting the upstream server"
                    },
                    "response-transformer": {
                        description: "Modify the upstream response before returning it to the client"
                    },
                    "correlation-id": {
                        description: "Correlate requests and responses using a unique ID"
                    },
                }
            },
            {
                name: "Logging",
                icon: "mdi-content-paste",
                description: "Log requests and response data using the best transport for your infrastructure",
                plugins: {
                    "tcp-log": {
                        description: "Send request and response logs to a TCP server"
                    },
                    "udp-log": {
                        description: "Send request and response logs to an UDP server"
                    },
                    "http-log": {
                        description: "Send request and response logs to an HTTP server"
                    },
                    "file-log": {
                        description: "Append request and response data to a log file on disk"
                    },
                    "syslog": {
                        description: "Send request and response logs to Syslog"
                    },
                    "statsd": {
                        description: "Send request and response logs to StatsD"
                    },
                    "loggly": {
                        description: "Send request and response logs to Loggly"
                    },

                }
            },
            {
                name: "Custom",
                description: "Custom Plugins",
                icon: "mdi-account-box-outline",
                plugins: {}
            }
        ]
    }
})

module.exports = KongPluginService
