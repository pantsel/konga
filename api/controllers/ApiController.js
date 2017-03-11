/**
 * ApiControllerController
 *
 * @description :: Server-side logic for managing Apicontrollers
 * @help        :: See http://sailsjs.org/#!/documentation/concepts/Controllers
 */


module.exports = {


    /**
     * Proxy requests to native Kong Admin API
     * @param req
     * @param res
     */
    proxy : function(req,res) {
        console.log(req.url)

        req.url = req.url.replace('/api','') // Remove the /api prefix
        global.$proxy.web(req, res, {
            target: sails.config.kong_admin_url
        });
    }
};