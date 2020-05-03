'use strict';

const unirest = require("unirest")
const ApiHealthCheckService = require('../services/ApiHealthCheckService')
const JWT = require("./Token");
const Utils = require('../helpers/utils');
const ProxyHooks = require('../services/KongProxyHooks');
const _ = require('lodash');


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
      case "basic_auth":
        var basicAuthtoken = Buffer.from(connection.username + ":" + connection.password).toString('base64');
        headers.Authorization = "Basic " + basicAuthtoken;
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

  info: function (connection) {
    return new Promise((resolve, reject) => {
      unirest.get(Utils.withoutTrailingSlash(connection.kong_admin_url))
        .headers(KongService.headers(connection, true))
        .end(function (response) {
          if (response.error) return reject(response);
          return resolve(response.body);
        });
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
          var data = previousData.concat(_.get(response, 'body.data', []));
          if (_.get(response, 'body.next')) {
            getData(data, (Utils.withoutTrailingSlash(req.kong_admin_url) || Utils.withoutTrailingSlash(req.connection.kong_admin_url)) + response.body.next);
          }
          else {
            try {
              response.body.data = data;
              ProxyHooks.afterEntityList(endpoint.replace('/', '').split('?')[0], req, response.body, (err, finalData) => {
                if (err) return cb(err);
                return cb(null, finalData)
              })
            }catch(err) {
              return cb(null, {
                data: []
              })
            }

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
  },

  put: function (url, connection, data) {
    // sails.log("KongService.put called() =>", url, connection, data);
    return new Promise((resolve, reject) => {
      unirest.put(Utils.withoutTrailingSlash(connection.kong_admin_url) +url.replace('/kong', ''))
        .headers(KongService.headers(connection, true))
        .send(data)
        .end(function (response) {
          if (response.error) return reject(response);
          return resolve(response.body);
        });
    })
  },

  post: function (url, connection, data) {
    // sails.log("KongService.put called() =>", url, connection, data);
    return new Promise((resolve, reject) => {
      unirest.post(Utils.withoutTrailingSlash(connection.kong_admin_url) +url.replace('/kong', ''))
        .headers(KongService.headers(connection, true))
        .send(data)
        .end(function (response) {
          if (response.error) return reject(response);
          return resolve(response.body);
        });
    })
  },


  fetchConsumerRoutes: async (req, consumerId, consumerAuths, consumerGroups, allPlugins) => {

    // Fetch all routes
    const routesRecords = await KongService.fetch(`/routes`, req)
    let routes = routesRecords.data;

    routes.forEach(route => {
      // Assign the consumer_id to the route.
      // We need this @ the frontend
      route.consumer_id = consumerId;

      // Assign plugins to the service
      route.plugins = _.filter(allPlugins, plugin => route.id === _.get(plugin, 'route.id'));

      // Separate acl plugins in an acl property
      // We will need this to better handle things @ the frontend
      let acl = _.find(route.plugins,item => item.name === 'acl');
      if(acl) route.acl = acl;

      let authenticationPlugins = _.filter(route.plugins, item => ['jwt','basic-auth','key-auth','hmac-auth','oauth2'].indexOf(item.name) > -1);
      authenticationPlugins = _.map(authenticationPlugins, item => item.name);
      sails.log("authenticationPlugins",authenticationPlugins);
      route.auths = authenticationPlugins;
    })


    // Gather routes with no access control restrictions whatsoever
    let open =  _.filter(routes,function (route) {
      return !route.acl && !route.auths.length;
    })

    // Gather routes with auths matching at least on consumer credential
    let matchingAuths = _.filter(routes,function (route) {
      return _.intersection(route.auths, consumerAuths).length > 0;
    });


    // Gather routes with access control restrictions whitelisting at least one of the consumer's groups.
    let whitelisted = _.filter(routes,function (route) {
      return route.acl && _.intersection(route.acl.config.whitelist,consumerGroups).length > 0;
    });

    // Gather routes  with no authentication plugins
    // & access control restrictions whitelisting at least one of the consumer's groups.
    let whitelistedNoAuth = _.filter(routes,function (route) {
      return route.acl
        && _.intersection(route.acl.config.whitelist,consumerGroups).length > 0
        && (!route.auths || !route.auths.length);
    });

    // Gather routes with no access control restrictions whatsoever
    let eligible = matchingAuths.length && whitelisted.length ? _.intersection(matchingAuths, whitelisted) : matchingAuths.concat(whitelisted);
    eligible = eligible.concat(whitelistedNoAuth);

    return {
      total : open.length + eligible.length,
      data  : _.uniqBy(open.concat(eligible), 'id')
    }

  }

}

module.exports = KongService
