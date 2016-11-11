'use strict';

module.exports = function kongRequestHost(request, response, next) {
  sails.log.verbose(__filename + ':' + __line + ' [Policy.kongRequestHost() called]');

    // First of all check if the request is coming from a valid kong proxy host
    if(sails.config.kong_proxy_hosts.indexOf(request.headers.host) < 0 ) {
        var error = new Error();

        error.status = 403;
        error.message = 'Forbidden - Invalid request host.';

        return next(error);
    }

    // Set the node to the requested one
    var node_id = request.headers['konga-node-id']
    if(!node_id) {
        var error = new Error();
        error.message = 'Missing required header "konga-node-id"'
        error.status = 400;
        return  next(error)
    }
    sails.models.kongnode.findOne(node_id).exec(function afterwards(err, node){
        if (err) return next(err)
        if(!node) {
            var error = new Error();
            error.message = 'Requested node not found'
            error.status = 404;
            return  next(error)
        }
        sails.config.kong_admin_url = 'http://' + node.kong_admin_ip + ':' + node.kong_admin_port

        return  next()
    })


};
