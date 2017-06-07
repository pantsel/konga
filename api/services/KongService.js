'use strict';

var unirest = require("unirest")
var ApiHealthCheckService = require('../services/ApiHealthCheckService')



var KongService = {

    create: function (req, res) {

        var request = unirest.post(sails.config.kong_admin_url + req.url.replace('/kong',''));
            
           if (sails.config.kong_admin_basic_auth_enabled) {
            request.auth(sails.config.kong_admin_username, sails.config.kong_admin_password, true);
        }
        
        
          request.send(req.body);
            request.end(function (response) {
                if (response.error)  return res.kongError(response)
                return res.json(response.body)
            })
    },

    createCb: function (req, res, cb) {

        var request = unirest.post(sails.config.kong_admin_url + req.url.replace('/kong',''))
           if (sails.config.kong_admin_basic_auth_enabled) {
            request.auth(sails.config.kong_admin_username, sails.config.kong_admin_password, true);
        }
        
           
            request.send(req.body);
            request.end(function (response) {
                if (response.error)  return cb(response)
                return cb(null,response.body)
            })
    },

    createFromEndpointCb: function (endpoint,data, cb) {

        var request = unirest.post(sails.config.kong_admin_url + endpoint);
              if (sails.config.kong_admin_basic_auth_enabled) {
            request.auth(sails.config.kong_admin_username, sails.config.kong_admin_password, true);
        }
        
        
            request.send(data);
            request.end(function (response) {
                //if(data.name == "request-transformer") {
                //    console.log(response.error)
                //}
                if (response.error)  return cb(response)
                return cb(null,response.body)
            })
    },


    retrieve: function (req, res) {
        var request = unirest.get(sails.config.kong_admin_url + req.url.replace('/kong',''));
            if (sails.config.kong_admin_basic_auth_enabled) {
            request.auth(sails.config.kong_admin_username, sails.config.kong_admin_password, true);
        }
        
          
            request.end(function (response) {
                if (response.error)  return res.kongError(response)
                return res.json(response.body)
            })
    },

    nodeStatus : function(node,cb) {
        var request = unirest.get(node.kong_admin_url + "/status");
            if (sails.config.kong_admin_basic_auth_enabled) {
            request.auth(sails.config.kong_admin_username, sails.config.kong_admin_password, true);
        }
        
          
            request.end(function (response) {
                if (response.error)  return cb(response)
                return cb(null,response.body)
            })
    },

    listAllCb: function (req, endpoint, cb) {
        var getData = function (previousData,url) {
            var request =unirest.get(url)
               if (sails.config.kong_admin_basic_auth_enabled) {
            request.auth(sails.config.kong_admin_username, sails.config.kong_admin_password, true);
        }
        
        
                request.end(function (response) {
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
            var request = unirest.get(url)
            if (sails.config.kong_admin_basic_auth_enabled) {
                request.auth(sails.config.kong_admin_username, sails.config.kong_admin_password, true);
            }
        
           request.end(function (response) {
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
        var request = unirest.patch(sails.config.kong_admin_url + req.url.replace('/kong',''));
             if (sails.config.kong_admin_basic_auth_enabled) {
            request.auth(sails.config.kong_admin_username, sails.config.kong_admin_password, true);
        }
        
         
            request.send(req.body)
            request.end(function (response) {
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
        var request = unirest.patch(sails.config.kong_admin_url + req.url.replace('/kong',''));
             if (sails.config.kong_admin_basic_auth_enabled) {
            request.auth(sails.config.kong_admin_username, sails.config.kong_admin_password, true);
        }
        
         
            request.send(req.body);
            request.end(function (response) {
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
        var request = unirest.put(sails.config.kong_admin_url + req.url.replace('/kong',''));
             if (sails.config.kong_admin_basic_auth_enabled) {
            request.auth(sails.config.kong_admin_username, sails.config.kong_admin_password, true);
        }
        
         
            request.send(req.body)
            request.end(function (response) {
                if (response.error) return res.kongError(response)
                return res.json(response.body)
            })
    },

    delete: function (req, res) {
        var request = unirest.delete(sails.config.kong_admin_url + req.url.replace('/kong',''));
               if (sails.config.kong_admin_basic_auth_enabled) {
            request.auth(sails.config.kong_admin_username, sails.config.kong_admin_password, true);
        }
        
        
            request.end(function (response) {
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
        var request = unirest.delete(sails.config.kong_admin_url + req.url.replace('/kong',''));
                if (sails.config.kong_admin_basic_auth_enabled) {
            request.auth(sails.config.kong_admin_username, sails.config.kong_admin_password, true);
        }
        
        
            request.end(function (response) {
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
