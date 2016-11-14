'use strict';

module.exports = function kongRequestHost(request, response, next) {
  sails.log.verbose(__filename + ':' + __line + ' [Policy.kongRequestHost() called]');

    // First of all check if the request is coming from a valid kong proxy host
    if(sails.config.whitelist_hosts.indexOf(request.host) < 0 ) {
        var error = new Error();
        error.status = 403;
        error.message = 'Forbidden - Invalid request host.';

        return next(error);
    }

    sails.config.kong_admin_url = request.headers['kong-admin-url'] || sails.config.kong_admin_url


    if(!sails.config.kong_admin_url) {
        var error = new Error();
        error.message = 'Kong admin URL is not defined'
        error.status = 400;
        return  next(error)
    }

    return  next()

};
