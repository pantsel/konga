# test/helpers
This folder contains helper functions for backend side tests. Generally these helpers are just node modules that
can be required in each test where those are needed.

## login.js
This file contains helper functions for authenticate process for sails.js backend. 

### authenticate(user, callback)
This will make actual authenticate process (login) to backend with specified user and returns user data and 
authorization JSON Web Token as in results. 

#### Usage example
```javascript
var request = require('supertest');
var expect = require('chai').expect;
var login = require("./helpers/login");

describe('your test description', function testSet() {
    var token = '';
    
    before(function beforeTest(done) {
        login.authenticate('demo', function callback(error, result) {
            if (!error) {
                token = result.token;
            }

            done(error);
        });
    });
    
    describe('another test description', function findRecords() {
        it('endpoint should return HTTP status 200 with array of objects as in body', function it(done) {
            request(sails.hooks.http.app)
                .get('/endpointUrlHere')
                .set('Authorization', 'bearer ' + token)
                .set('Content-Type', 'application/json')
                .expect(200)
                .end(
                    function end(error, result) {
                        if (error) {
                            return done(error);
                        }

                        expect(result.res.body).to.be.a('array');
                        expect(result.res.body).to.have.length(123);
                        
                        result.res.body.forEach(function(value) {
                            expect(value).to.be.a('object');
                        });

                        done();
                    }
                );
        });
    });
});
```