'use strict';

var request = require("supertest");

/**
 * Generic helper function to authenticate specified user with current sails testing instance. Function
 * will call specified callback function with response (res) body, which contains all necessary user data
 * and Json Web Token, which is required to make actual API calls to backend.
 *
 * @param   {String}    user    User which to use within login
 * @param   {Function}  next    Callback function which is called after login attempt
 */
module.exports.authenticate = function authenticate(user, next) {
    // Static credential information, which are used within tests.
    var credentials = {
        demo: {
            identifier: 'demo',
            password: 'demodemodemo'
        },
        admin: {
            identifier: 'admin',
            password: 'adminadminadmin'
        }
    };

    request(sails.hooks.http.app)
        .post('/login')
        .set('Content-Type', 'application/json')
        .send(credentials[user])
        .expect(200)
        .end(
            function(error, result) {
                if (error) {
                    next(error);
                } else {
                    next(null, result.res.body);
                }
            }
        );
};
