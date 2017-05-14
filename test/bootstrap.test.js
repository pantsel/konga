/**
 * Mocha bootstrap file for backend application tests.
 */

var Sails = require('sails');
var fs = require('fs');

process.env.NODE_ENV = 'test';

/**
 * Mocha bootstrap before function, that is run before any tests are being processed. This will lift sails.js with
 * test configuration.
 *
 * Note! Tests will use localDiskDb connection and this _removes_ possible existing disk store file from .tmp folder!
 *
 * @param   {Function}  next    Callback function
 */
before(function before(next) {
    fs.unlink('.tmp/localDiskDb.db', function unlinkDone(error) {
        Sails.lift({
            // configuration for testing purposes
            models: {
                connection: 'localDiskDb',
                migrate: 'drop'
            },
            port: 1336,
            environment: 'test',
            log: {
                level: 'error'
            },
            hooks: {
                grunt: false
            }
        }, function callback(error, sails) {
            // Yeah sails is lifted now!
            next(error, sails);
        });
    });
});

/**
 * Mocha bootstrap after function, that is run after all tests are processed. Main purpose of this is just to
 * lower sails test instance.
 *
 * @param   {Function}  next    Callback function
 */
after(function after(next) {
    sails.lower(next);
});
