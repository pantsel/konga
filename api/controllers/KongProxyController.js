/**
 * RemoteApiController
 */

var unirest = require("unirest");
var KongService = require("../services/KongService");
var ProxyHooks = require("../services/KongProxyHooks");
var _ = require("lodash");
var Utils = require('../services/Utils');


function getEntityFromRequest(req) {
  if(!req.path) return null;
  return req.path.replace('/kong', '').split("/").filter(function (e) {
    return e;
  })[0];
}

var self = module.exports = {


  /**
   * Proxy requests to native Kong Admin API
   * @param req
   * @param res
   */
  proxy: function (req, res) {

    req.url = req.url.replace('/kong', ''); // Remove the /kong prefix
    var entity = getEntityFromRequest(req);

    sails.log.debug("KongProxyController:req.method", req.method)
    sails.log.debug("KongProxyController:req.url", req.url)
    sails.log.debug("KongProxyController:entity", entity)

    // Fix update method by setting it to "PATCH" as Kong requires
    if (req.method.toLowerCase() === 'put') {
      req.method = "PATCH";
    }


    if (!req.connection) {
      return res.badRequest({
        message: 'No Kong connection is defined'
      });
    }

    sails.log("Kong admin url =>", req.connection.kong_admin_url);

    var request = unirest[req.method.toLowerCase()](req.connection.kong_admin_url + req.url)

    // Assign Konga correlations to a var if set in the request
    var konga_extras;
    if(req.body && req.body.extras) {
      konga_extras = req.body.extras;
      // Remove the correlations attribute so that we don't break the request to Kong.
      // If we need them later, they will be available in the `konga_extras` var
      delete req.body.extras;
    }

    // Set the appropriate request headers
    request.headers(KongService.headers(req.connection, true))

    // Apply monkey patches
    if (['post', 'put', 'patch'].indexOf(req.method.toLowerCase()) > -1) {

      if (req.body && req.body.orderlist) {
        for (var i = 0; i < req.body.orderlist.length; i++) {
          try {
            req.body.orderlist[i] = parseInt(req.body.orderlist[i])
          } catch (err) {
            return res.badRequest({
              body: {
                message: 'Ordelist entities must be integers'
              }
            });
          }
        }
      }
    }

    // Apply before Hooks
    switch(req.method.toLowerCase()) {
      case "patch":
        return ProxyHooks.beforeEntityUpdate(entity, req.param("id"), req.connection.id, _.merge(req.body,{extras: konga_extras}), function (err, data) {
          if(err) return res.badRequest(err);
          req.body = data; // Assign the resulting data to req.body
          return self.send(entity, request, konga_extras, req, res)
        });
      default:
        return self.send(entity, request, konga_extras,  req, res);
    }

  },


  /**
   * All GET methods to Kong will be using this methods
   * starting from Kong 1.x due to Kong's limitations on listing size
   * @param req
   * @param res
   */
  listProxy: (req, res) => {
    req.url = req.url.replace('/kong', ''); // Remove the /kong prefix
    const entity = req.params.entity;

    sails.log.debug("KongProxyController:listAllEntityRecords:req.method", req.method)
    sails.log.debug("KongProxyController:listAllEntityRecords:req.url", req.url)
    sails.log.debug("KongProxyController:listAllEntityRecords:entity", entity)

    KongService.listAllCb(req, req.url, (err, data) => {
      if(err) return res.negotiate(err);
      return res.json(data);
    })
  },

  /**
   * Actually send the request to Kong
   * @param entity
   * @param unirestReq
   * @param konga_extras
   * @param req
   * @param res
   */
  send: function (entity, unirestReq, konga_extras, req, res) {

    unirestReq.send(req.body);

    unirestReq.end(function (response) {
      if (response.error) {
        sails.log.error("KongProxyController", "request error", response.body);
        return res.negotiate(response);
      }


      // Apply after Hooks
      switch(req.method.toLowerCase()) {
        case "get":
          return ProxyHooks.afterEntityRetrieve(entity, req, response.body, function (err, data) {
            if(err) return res.badRequest(err);
            return res.json(data);
          });
        case "post":
          return ProxyHooks.afterEntityCreate(entity, req, response.body, konga_extras || {}, function (err, data) {
            if(err) return res.badRequest(err);
            return res.json(data);
          });
        case "delete":
          return ProxyHooks.afterEntityDelete(entity,req,function (err) {
            if(err) return res.badRequest(err);
            return res.json(response);
          });
        default:
          return res.json(response.body)
      }


    });
  }
};