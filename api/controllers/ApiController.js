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

        sails.log("req.url",req.url)

        // Fix upstream method
        console.log("req.url.split('/')",req.url.split('/'))
        if(req.url.split('/')[1] == 'upstreams' && req.method.toLowerCase() == 'put') {
            req.method = "PATCH"
        }


        sails.log("ApiController",sails.config.kong_admin_url + req.url)
        sails.log("req.method",req.method)

        var request = unirest[req.method.toLowerCase()](sails.config.kong_admin_url + req.url)
        request.headers({'Content-Type': 'application/json'})
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

            request.send(req.body)
        }


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