'use strict';

var unirest = require("unirest")
var ApiHealthCheckService = require('../services/ApiHealthCheckService')



var KongService = {

    create: function (req, res) {

        unirest.post(req.node_id + req.url.replace('/kong',''))
            .header('Content-Type', 'application/json')
            .send(req.body)
            .end(function (response) {
                if (response.error)  return res.kongError(response)
                return res.json(response.body)
            })
    },

    createCb: function (req, res, cb) {

        unirest.post(req.node_id + req.url.replace('/kong',''))
            .header('Content-Type', 'application/json')
            .send(req.body)
            .end(function (response) {
                if (response.error)  return cb(response)
                return cb(null,response.body)
            })
    },

    createFromEndpointCb: function (endpoint,data, req, cb) {

        var headers = {'Content-Type': 'application/json'}

        // If apikey is set in headers, use it
        if(req.kong_api_key) {
            headers['apikey'] = req.kong_api_key
        }

        unirest.post(req.node_id + endpoint)
            .headers(headers)
            .send(data)
            .end(function (response) {
                //if(data.name == "request-transformer") {
                //    console.log(response.error)
                //}
                if (response.error)  return cb(response)
                return cb(null,response.body)
            })
    },


    retrieve: function (req, res) {
        unirest.get(req.node_id + req.url.replace('/kong',''))
            .header('Content-Type', 'application/json')
            .end(function (response) {
                if (response.error)  return res.kongError(response)
                return res.json(response.body)
            })
    },

    nodeStatus : function(node,cb) {

        var headers = {'Content-Type': 'application/json'}

        if(node.kong_api_key) {
            headers.apikey = node.kong_api_key
        }

        unirest.get(node.kong_admin_url + "/status")
            .headers(headers)
            .end(function (response) {
                if (response.error)  return cb(response)
                return cb(null,response.body)
            })
    },

    listAllCb: function (req, endpoint, cb) {

        var headers = {'Content-Type': 'application/json'}

        // If apikey is set in headers, use it
        if(req.kong_api_key) {
            headers['apikey'] = req.kong_api_key
        }

        var getData = function (previousData,url) {
            unirest.get(url)
                .headers(headers)
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
        getData([],req.node_id  + endpoint);
    },


    list: function (req, res) {
        var getData = function (previousData,url) {
            unirest.get(url)
                .header('Content-Type', 'application/json')
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
        getData([],req.node_id + req.url.replace('/kong',''));
    },

    update: function (req, res) {
        unirest.patch(req.node_id + req.url.replace('/kong',''))
            .header('Content-Type', 'application/json')
            .send(req.body)
            .end(function (response) {
                if (response.error) return res.kongError(response)

                if(req.url.indexOf("/kong/apis") > -1) {
                    // If api was updated, update its health checks as well
                    ApiHealthCheckService.updateCb({
                        api_id : response.body.id
                    },{api : response.body},function(err,updated){})
                }

                return res.json(response.body)
            })
    },

    updateCb: function (req, res,cb) {
        unirest.patch(req.node_id + req.url.replace('/kong',''))
            .header('Content-Type', 'application/json')
            .send(req.body)
            .end(function (response) {
                if (response.error) return cb(response)

                if(req.url.indexOf("/kong/apis") > -1) {
                    // If api was updated, update its health checks as well
                    // If api was updated, update its health checks as well
                    ApiHealthCheckService.updateCb({
                        api_id : response.body.id
                    },{api : response.body},function(err,updated){})
                }

                return cb(null,response.body)
            })
    },

    updateOrCreate: function (req, res) {
        unirest.put(req.node_id + req.url.replace('/kong',''))
            .header('Content-Type', 'application/json')
            .send(req.body)
            .end(function (response) {
                if (response.error) return res.kongError(response)
                return res.json(response.body)
            })
    },

    delete: function (req, res) {
        unirest.delete(req.node_id + req.url.replace('/kong',''))
            .header('Content-Type', 'application/json')
            .end(function (response) {
                if (response.error) return res.kongError(response)

                if(req.url.indexOf("/kong/apis") > -1) {
                    // If api was deleted, delete its health checks as well
                    var id = req.url.substr(req.url.lastIndexOf('/') + 1)

                    // If api was updated, update its health checks as well
                    ApiHealthCheckService.deleteCb({
                        api_id : id
                    },function(err,updated){})
                }

                return res.json(response.body)
            })
    },

    deleteCb: function (req, res,cb) {
        unirest.delete(req.node_id + req.url.replace('/kong',''))
            .header('Content-Type', 'application/json')
            .end(function (response) {
                if (response.error) return cb(response)

                if(req.url.indexOf("/kong/apis") > -1) {
                    // If api was deleted, delete its health checks as well
                    var id = req.url.pop() || req.url.pop();  // handle potential trailing slash

                    ApiHealthCheckService.deleteCb({
                        api_id : id
                    },function(err,updated){})
                }

                return cb(null,response.body)
            })
    }
}

module.exports = KongService
