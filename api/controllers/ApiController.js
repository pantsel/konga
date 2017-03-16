/**
 * ApiController
 */

var unirest = require("unirest")

module.exports = {


    /**
     * Proxy requests to native Kong Admin API
     * @param req
     * @param res
     */
    proxy : function(req,res) {


        req.url = req.url.replace('/api','') // Remove the /api prefix

        sails.log("ApiController",sails.config.kong_admin_url + req.url)
        sails.log("req.method",req.method)


        var request = unirest[req.method.toLowerCase()](sails.config.kong_admin_url + req.url)
        if(['post','put','patch'].indexOf(req.method.toLowerCase()) > -1)
            request.send(req.body)

        request.end(function (response) {
            if (response.error)  return res.negotiate(response)
            return res.json(response.body)
        })


        //if(req.body) {
        //    req.body = JSON.stringify(req.body)
        //}
        //
        //global.$proxy.web(req, res, {
        //    target: sails.config.kong_admin_url
        //});
    }
};