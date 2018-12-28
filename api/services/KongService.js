'use strict';

var unirest = require("unirest")
var ApiHealthCheckService = require('../services/ApiHealthCheckService')
var JWT = require("./Token");
var Utils = require('../helpers/utils');
var ProxyHooks = require('../services/KongProxyHooks');


function getParameterByName(name, url) {
  if (!url) url = window.location.href;
  name = name.replace(/[\[\]]/g, '\\$&');
  var regex = new RegExp('[?&]' + name + '(=([^&#]*)|&|#|$)'),
    results = regex.exec(url);
  if (!results) return null;
  if (!results[2]) return '';
  return decodeURIComponent(results[2].replace(/\+/g, ' '));
}

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

    unirest.post(Utils.withoutTrailingSlash(req.connection.kong_admin_url) + req.url.replace('/kong', ''))
      .headers(KongService.headers(req, true))
      .send(req.body)
      .end(function (response) {
        if (response.error) return res.kongError(response);
        return res.json(response.body);
      });
  },

  createCb: function (req, res, cb) {

    unirest.post(Utils.withoutTrailingSlash(req.connection.kong_admin_url) + req.url.replace('/kong', ''))
      .headers(KongService.headers(req, true))
      .send(req.body)
      .end(function (response) {
        if (response.error) return cb(response);
        return cb(null, response.body);
      });
  },

  createFromEndpointCb: function (endpoint, data, req, cb) {

    unirest.post(Utils.withoutTrailingSlash(req.connection.kong_admin_url) + endpoint)
      .headers(KongService.headers(req, true))
      .send(data)
      .end(function (response) {
        if (response.error) return cb(response)
        return cb(null, response.body)
      });
  },

  deleteFromEndpointCb: function (endpoint, req, cb) {
    sails.log('Deleting ' + Utils.withoutTrailingSlash(req.connection.kong_admin_url) + endpoint);
    unirest.delete(Utils.withoutTrailingSlash(req.connection.kong_admin_url) + endpoint)
      .headers(KongService.headers(req, true))
      .end(function (response) {
        if (response.error) return cb(response)
        return cb(null, response.body)
      });
  },

  retrieve: function (req, res) {
    unirest.get(Utils.withoutTrailingSlash(req.connection.kong_admin_url) + req.url.replace('/kong', ''))
      .headers(KongService.headers(req, true))
      .end(function (response) {
        if (response.error) return res.kongError(response);
        return res.json(response.body);
      });
  },

  get: function (req, endpoint) {
    var self = this;
    return new Promise((resolve, reject) => {
      self.listAllCb(req, endpoint, (err, data) => {
        if (err) return reject(err);
        resolve(data);
      })
    });

  },

  fetch: (endpoint,req) => {
    return new Promise((resolve, reject) => {
      KongService.listAllCb(req, endpoint, (err, data) => {
        if(err) {
          return reject(err)
        }
        return resolve(data)
      })


      // let sizeQs = (endpoint.indexOf("?") > -1 ? "&" : "?") + `size=${sails.config.blueprints.defaultLimit}`;
      // unirest.get(Utils.withoutTrailingSlash(req.connection.kong_admin_url) + endpoint + sizeQs)
      //   .headers(KongService.headers(req, true))
      //   .end(function (response) {
      //     if (response.error) return reject(response)
      //     return resolve(response.body)
      //   });
    })

  },

  nodeStatus: function (node, cb) {

    unirest.get(Utils.withoutTrailingSlash(node.kong_admin_url) + "/status")
      .headers(KongService.headers(node, true))
      .end(function (response) {
        if (response.error) return cb(response);
        return cb(null, response.body);
      });
  },

  nodeInfo: function (node, cb) {
    unirest.get(Utils.withoutTrailingSlash(node.kong_admin_url))
      .headers(KongService.headers(node, true))
      .end(function (response) {
        if (response.error) return cb(response);
        return cb(null, response.body);
      });
  },

  listAllCb: function (req, endpoint, cb) {
    var url = (Utils.withoutTrailingSlash(req.kong_admin_url) || Utils.withoutTrailingSlash(req.connection.kong_admin_url)) + endpoint;

    // Always add size=1000 the url just to be sure
    // no more than the needed amount of requests are performed
    const sizeParam = getParameterByName('size', url);
    if(!sizeParam)  url += url.indexOf('?') > -1 ? `&size=1000` : `?size=1000`;

    sails.log.debug('KongService: listAllCb', url);
    var getData = function (previousData, url) {
      unirest.get(url)
        .headers(KongService.headers(req, true))
        .end(function (response) {
          if (response.error) return cb(response)
          var data = previousData.concat(response.body.data);
          if (response.body.next) {
            getData(data, (Utils.withoutTrailingSlash(req.kong_admin_url) || Utils.withoutTrailingSlash(req.connection.kong_admin_url)) + response.body.next);
          }
          else {
            response.body.data = data;
            ProxyHooks.afterEntityList(endpoint.replace('/', ''), req, response.body, (err, finalData) => {
              if (err) return cb(err);
              return cb(null, finalData)
            })
          }
        });
    };
    getData([], `${url}`);
  },

  list: function (req, res) {
    var getData = function (previousData, url) {
      unirest.get(url)
        .headers(KongService.headers(req, true))
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
    getData([], (Utils.withoutTrailingSlash(req.kong_admin_url) || Utils.withoutTrailingSlash(req.connection.kong_admin_url)) + req.url.replace('/kong', ''));
  },

  update: function (req, res) {
    unirest.patch(Utils.withoutTrailingSlash(req.connection.kong_admin_url) + req.url.replace('/kong', ''))
      .headers(KongService.headers(req, true))
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
    unirest.patch(Utils.withoutTrailingSlash(req.connection.kong_admin_url) + req.url.replace('/kong', ''))
      .headers(KongService.headers(req, true))
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
    unirest.put(Utils.withoutTrailingSlash(req.connection.kong_admin_url) + req.url.replace('/kong', ''))
      .headers(KongService.headers(req, true))
      .send(req.body)
      .end(function (response) {
        if (response.error) return res.kongError(response);
        return res.json(response.body);
      });
  },

  delete: function (req, res) {
    unirest.delete(Utils.withoutTrailingSlash(req.connection.kong_admin_url) + req.url.replace('/kong', ''))
      .headers(KongService.headers(req, true))
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
    unirest.delete(Utils.withoutTrailingSlash(req.connection.kong_admin_url) + req.url.replace('/kong', ''))
      .headers(KongService.headers(req, true))
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
