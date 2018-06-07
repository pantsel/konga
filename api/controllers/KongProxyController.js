/**
 * RemoteApiController
 */

var unirest = require("unirest");
var KongService = require("../services/KongService");

module.exports = {


  /**
   * Proxy requests to native Kong Admin API
   * @param req
   * @param res
   */
  proxy: function (req, res) {

    req.url = req.url.replace('/kong', ''); // Remove the /api prefix

    sails.log.debug("KongProxyController:req.method", req.method)
    sails.log.debug("KongProxyController:req.url", req.url)

    // Fix update method by setting it to "PATCH"
    // as Kong requires
    if (req.method.toLowerCase() === 'put') {
      req.method = "PATCH";
    }


    if (!req.connection) {
      return res.badRequest({
        message: 'No Kong connection is defined'
      });
    }

    var request = unirest[req.method.toLowerCase()](req.connection.kong_admin_url + req.url)
    request.headers(KongService.headers(req.connection, true))
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

    request.send(req.body);


    request.end(function (response) {
      if (response.error) {
        sails.log.error("KongProxyController", "request error", response.body);
        return res.negotiate(response);
      }

      // If an API was deleted, delete it's assigned health checks as well
      // ToDo: emit an api.deleted event and handle it somewhere more convenient
      if(req.method.toLowerCase() === 'delete' && req.url.indexOf('/apis/') > -1) {
        var apiId = req.url.split("/").slice(-1).pop()
        sails.log("An API with id " + apiId + "was deleted");
        sails.models.apihealthcheck.destroy({
          id: apiId
        }).exec(function (err) {
          if(err) {
            sails.log("Failed to delete healthcecks of API " + apiId);
          }
        });
      }

      return res.json(response.body);
    });
  }
};