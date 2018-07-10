'use strict';

var unirest = require("unirest")
var ApiHealthCheckService = require('../services/ApiHealthCheckService')
var JWT = require("./Token");


var KongService = {

  headers: function (node, isJSON) {

    // Monkey-patch backwards compatibility with request obj
    var connection = node.connection || node;
    var headers = {};

    if (isJSON) {
      headers = {'Content-Type': 'application/json'}
    }

    // Set required headers according to connection type
    switch (connection.type) {
      case "key_auth":
        headers.apikey = connection.kong_api_key;
        break;
      case "jwt":
        var token = JWT.issueKongConnectionToken(connection);
        headers.Authorization = "Bearer " + token;
        break;
    }

    return headers;
  },

  create: function (req, res) {

    unirest.post(req.connection.kong_admin_url + req.url.replace('/kong', ''))
      .header('Content-Type', 'application/json')
      .send(req.body)
      .end(function (response) {
        if (response.error) return res.kongError(response);
        return res.json(response.body);
      });
  },

  createCb: function (req, res, cb) {

    unirest.post(req.connection.kong_admin_url + req.url.replace('/kong', ''))
      .header('Content-Type', 'application/json')
      .send(req.body)
      .end(function (response) {
        if (response.error) return cb(response);
        return cb(null, response.body);
      });
  },

  createFromEndpointCb: function (endpoint, data, req, cb) {

    unirest.post(req.connection.kong_admin_url + endpoint)
      .headers(KongService.headers(req, true))
      .send(data)
      .end(function (response) {
        if (response.error) return cb(response)
        return cb(null, response.body)
      });
  },

  deleteFromEndpointCb: function (endpoint, req, cb) {
    sails.log('Deleting ' + req.connection.kong_admin_url + endpoint);
    unirest.delete(req.connection.kong_admin_url + endpoint)
      .headers(KongService.headers(req, true))
      .end(function (response) {
        if (response.error) return cb(response)
        return cb(null, response.body)
      });
  },


  retrieve: function (req, res) {
    unirest.get(req.connection.kong_admin_url + req.url.replace('/kong', ''))
      .header('Content-Type', 'application/json')
      .end(function (response) {
        if (response.error) return res.kongError(response);
        return res.json(response.body);
      });
  },


  fetch: (endpoint,req) => {
    return new Promise((resolve, reject) => {
      unirest.get(req.connection.kong_admin_url + endpoint)
        .header('Content-Type', 'application/json')
        .end(function (response) {
          if (response.error) return reject(response)
          return resolve(response.body)
        });
    })

  },

  nodeStatus: function (node, cb) {

    unirest.get(node.kong_admin_url + "/status")
      .headers(KongService.headers(node, true))
      .end(function (response) {
        if (response.error) return cb(response);
        return cb(null, response.body);
      });
  },


  nodeInfo: function (node, cb) {
    unirest.get(node.kong_admin_url)
      .headers(KongService.headers(node, true))
      .end(function (response) {
        if (response.error) return cb(response);
        return cb(null, response.body);
      });
  },

  listAllCb: function (req, endpoint, cb) {
    var getData = function (previousData, url) {
      unirest.get(url)
        .headers(KongService.headers(req, true))
        .end(function (response) {
          if (response.error) return cb(response)
          var data = previousData.concat(response.body.data);
          if (response.body.next) {
            getData(data, response.body.next);
          }
          else {
            response.body.data = data;
            return cb(null, response.body)
          }
        });
    };
    getData([], (req.kong_admin_url || req.connection.kong_admin_url) + endpoint);
  },


  list: function (req, res) {
    var getData = function (previousData, url) {
      unirest.get(url)
        .header('Content-Type', 'application/json')
        .end(function (response) {
          if (response.error) return res.kongError(response)
          var apis = previousData.concat(response.body.data);
          if (response.body.next) {
            getData(apis, response.body.next);
          }
          else {
            response.body.data = apis;
            return res.json(response.body);
          }
        });
    };
    getData([], (req.kong_admin_url || req.connection.kong_admin_url) + req.url.replace('/kong', ''));
  },

  update: function (req, res) {
    unirest.patch(req.connection.kong_admin_url + req.url.replace('/kong', ''))
      .header('Content-Type', 'application/json')
      .send(req.body)
      .end(function (response) {
        if (response.error) return res.kongError(response);

        if (req.url.indexOf("/kong/apis") > -1) {
          // If api was updated, update its health checks as well
          ApiHealthCheckService.updateCb({
            api_id: response.body.id
          }, {api: response.body}, function (err, updated) {
          });
        }

        return res.json(response.body);
      });
  },

  updateCb: function (req, res, cb) {
    unirest.patch(req.connection.kong_admin_url + req.url.replace('/kong', ''))
      .header('Content-Type', 'application/json')
      .send(req.body)
      .end(function (response) {
        if (response.error) return cb(response);

        if (req.url.indexOf("/kong/apis") > -1) {
          // If api was updated, update its health checks as well
          // If api was updated, update its health checks as well
          ApiHealthCheckService.updateCb({
            api_id: response.body.id
          }, {api: response.body}, function (err, updated) {
          });
        }

        return cb(null, response.body);
      });
  },

  updateOrCreate: function (req, res) {
    unirest.put(req.connection.kong_admin_url + req.url.replace('/kong', ''))
      .header('Content-Type', 'application/json')
      .send(req.body)
      .end(function (response) {
        if (response.error) return res.kongError(response);
        return res.json(response.body);
      });
  },

  delete: function (req, res) {
    unirest.delete(req.connection.kong_admin_url + req.url.replace('/kong', ''))
      .header('Content-Type', 'application/json')
      .end(function (response) {
        if (response.error) return res.kongError(response);

        if (req.url.indexOf("/kong/apis") > -1) {
          // If api was deleted, delete its health checks as well
          var id = req.url.substr(req.url.lastIndexOf('/') + 1)

          // If api was updated, update its health checks as well
          ApiHealthCheckService.deleteCb({
            api_id: id
          }, function (err, updated) {
          });
        }

        return res.json(response.body);
      })
  },

  deleteCb: function (req, res, cb) {
    unirest.delete(req.connection.kong_admin_url + req.url.replace('/kong', ''))
      .header('Content-Type', 'application/json')
      .end(function (response) {
        if (response.error) return cb(response);

        if (req.url.indexOf("/kong/apis") > -1) {
          // If api was deleted, delete its health checks as well
          var id = req.url.pop() || req.url.pop();  // handle potential trailing slash

          ApiHealthCheckService.deleteCb({
            api_id: id
          }, function (err, updated) {
          });
        }

        return cb(null, response.body);
      });
  }
}

module.exports = KongService
