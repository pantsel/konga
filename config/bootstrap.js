'use strict';

//var httpProxy = require('http-proxy')
//global.$proxy

module.exports.bootstrap = function bootstrap(next) {
    /**
     * It's very important to trigger this 'next' method when you are finished with the bootstrap!
     * (otherwise your server will never lift, since it's waiting on the bootstrap)
     */
    sails.services.passport.loadStrategies();
    //global.$proxy = httpProxy.createProxyServer({});
    //
    //global.$proxy.on('proxyRes', function (proxyRes, req, res) {
    //    console.log('RAW Response from the target', {
    //        headers : proxyRes.headers,
    //        statusCode : proxyRes.statusCode,
    //    });
    //});

    next();
};
