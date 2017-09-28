'use strict';

var fs = require('fs')

module.exports.bootstrap = function bootstrap(next) {
    /**
     * It's very important to trigger this 'next' method when you are finished with the bootstrap!
     * (otherwise your server will never lift, since it's waiting on the bootstrap)
     */
    sails.services.passport.loadStrategies();


    // Create Konga data directories
    var dirs = [( process.env.STORAGE_PATH || './kongadata/' ), ( process.env.STORAGE_PATH || './kongadata/' )+ 'uploads']


    dirs.forEach(function(dir){
        if (!fs.existsSync(dir)){
            fs.mkdirSync(dir);
        }
    })

    next();
};
