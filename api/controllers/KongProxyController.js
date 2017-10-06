/**
 * RemoteApiController
 */

var unirest = require("unirest")

module.exports = {


    /**
     * Proxy requests to native Kong Admin API
     * @param req
     * @param res
     */
    proxy : function(req,res) {

        req.url = req.url.replace('/kong','') // Remove the /api prefix

        sails.log("req.url",req.url)

        // Fix update method by setting it to "PATCH"
        // as Kong requires

        if(req.method.toLowerCase() == 'put') {
            req.method = "PATCH"
        }


        sails.log("KongProxyController",req.node_id + req.url)
        sails.log("req.method",req.method)

        var headers = {'Content-Type': 'application/json'}

        // If apikey is set in headers, use it
        if(req.kong_api_key) {
            headers['apikey'] = req.kong_api_key
        }

        var request = unirest[req.method.toLowerCase()](req.node_id + req.url)
        request.headers(headers)
        if(['post','put','patch'].indexOf(req.method.toLowerCase()) > -1)
        {

            if(req.body && req.body.orderlist) {
                for( var i = 0; i < req.body.orderlist.length; i ++) {
                    try{
                        req.body.orderlist[i] = parseInt(req.body.orderlist[i])
                    }catch(err) {
                        return res.badRequest({
                            body : {
                                message : 'Ordelist entities must be integers'
                            }
                        })
                    }
                }
            }


        }

        request.send(req.body);


        request.end(function (response) {
            if (response.error)  return res.negotiate(response)
            return res.json(response.body)
        })
    }
};