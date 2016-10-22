'use strict';

var request = require('supertest');
var expect = require('chai').expect;
var login = require("./../../helpers/login");
var _ = require('lodash');
var async = require('async');

describe('Generic controller test', function controllerTest() {
    [
        {
            controller: 'AuthorController',
            url: '/author/',
            identifier: 2,
            count: 5,
            data: {
                identifier: {
                    name: "Leo Tolstoy",
                    description: "Count Lev Nikolayevich Tolstoy (Russian: Лев Никола́евич Толсто́й, pronounced [lʲef nʲɪkɐˈlaɪvʲɪt͡ɕ tɐlˈstoj] ( listen); 9 September [O.S. 28 August] 1828 – 20 November [O.S. 7 November] 1910), also known as Leo Tolstoy, was a Russian writer and philosopher who primarily wrote novels and short stories. Tolstoy was a master of realistic fiction and is widely considered one of the world's greatest novelists. He is best known for two long novels, War and Peace (1869) and Anna Karenina (1877). Tolstoy first achieved literary acclaim in his 20s with his semi-autobiographical trilogy of novels, Childhood, Boyhood, and Youth (1852-1856) and Sevastopol Sketches (1855), based on his experiences in the Crimean War. His fiction output also includes two additional novels, dozens of short stories, and several famous novellas, including The Death of Ivan Ilych, Family Happiness, and Hadji Murad. Later in life, he also wrote plays and essays. Tolstoy is equally known for his complicated and paradoxical persona and for his extreme moralistic and ascetic views, which he adopted after a moral crisis and spiritual awakening in the 1870s, after which he also became noted as a moral thinker and social reformer."
                },
                newRecord: {
                    name: "Frank Herbert",
                    description: "Franklin Patrick Herbert, Jr. was an American science fiction writer best known for the novel Dune and its five sequels."
                }
            }
        },
        {
            controller: 'BookController',
            url: '/book/',
            identifier: 2,
            count: 48,
            data: {
                identifier: {
                    releaseDate: new Date("1937-01-01T00:00:00.000Z"),
                    title: "The Hobbit",
                    description: "The Hobbit, or There and Back Again, is a fantasy novel and children's book by English author J. R. R. Tolkien. It was published on 21 September 1937 to wide critical acclaim, being nominated for the Carnegie Medal and awarded a prize from the New York Herald Tribune for best juvenile fiction. The book remains popular and is recognized as a classic in children's literature.\r\nSet in a time \"Between the Dawn of Færie and the Dominion of Men\", The Hobbit follows the quest of home-loving hobbit Bilbo Baggins to win a share of the treasure guarded by the dragon, Smaug. Bilbo's journey takes him from light-hearted, rural surroundings into more sinister territory. The story is told in the form of an episodic quest, and most chapters introduce a specific creature, or type of creature, of Tolkien's Wilderland. By accepting the disreputable, romantic, fey and adventurous side of his nature and applying his wits and common sense, Bilbo gains a new level of maturity, competence and wisdom. The story reaches its climax in the Battle of Five Armies, where many of the characters and creatures from earlier chapters re-emerge to engage in conflict.\r\nPersonal growth and forms of heroism are central themes of the story. Along with motifs of warfare, these themes have led critics to view Tolkien's own experiences during World War I as instrumental in shaping the story. The author's scholarly knowledge of Germanic philology and interest in fairy tales are often noted as influences.\r\nEncouraged by the book's critical and financial success, the publisher requested a sequel. As Tolkien's work on the successor The Lord of the Rings progressed, he made retrospective accommodations for it in The Hobbit. These few but significant changes were integrated into the second edition. Further editions followed with minor emendations, including those reflecting Tolkien's changing concept of the world into which Bilbo stumbled. The work has never been out of print. Its ongoing legacy encompasses many adaptations for stage, screen, radio, board games and video games. Several of these adaptations have received critical recognition on their own merits.",
                    author: 1
                },
                newRecord: {
                    releaseDate: new Date("1885-01-01T00:00:00.000Z"),
                    title: "How Much Land Does a Man Need?",
                    description: "In his quest to obtain more land, Pakhom travels all the way to the land of the Bashkirs, where he may acquire as much land as he can walk around in one day.",
                    author: 2
                }
            }
        },
        {
            controller: 'MessageController',
            url: '/message/',
            identifier: 1,
            count: 1,
            data: {
                identifier: {
                    nick: "da_wunder",
                    message: "Hello World!"
                },
                newRecord: {
                    nick: "awesome nick",
                    message: "Hello to you too!"
                }
            }
        },
        {
            controller: 'UserController',
            url: '/user/',
            identifier: 1,
            count: 2,
            data: {
                identifier: {
                    username: "admin",
                    email: "admin@some.domain",
                    firstName: "Arnold",
                    lastName: "Administrator",
                    admin: true
                },
                newRecord: {
                    username: "schwarzenegger",
                    email: "schwarzenegger@some.domain",
                    firstName: "Arnold",
                    lastName: "Schwarzenegger",
                    admin: false
                },
                updateRecord: {
                    username: "stallone",
                    email: "stallone@some.domain",
                    firstName: "Sylvester",
                    lastName: "Stallone",
                    admin: false
                }

            }
        }
    ].forEach(function testCase(testCase) {
        describe('for \'' + testCase.controller + '\' API endpoints', function controllerTest() {
            describe('with invalid headers', function withInvalidAuthorizationHeaders() {
                describe('GET ' + testCase.url, function getRequestTests() {
                    describe('no authorization header given', function getRequest() {
                        describe('GET ' + testCase.url, function getRequest() {
                            it('should complain about missing authorization header', function it(done) {
                                request(sails.hooks.http.app)
                                    .get(testCase.url)
                                    .set('Content-Type', 'application/json')
                                    .expect(401)
                                    .end(
                                        function end(error, result) {
                                            if (error) {
                                                return done(error);
                                            }
    
                                            expect(result.res.body.message).to.equal('No authorization header was found');
    
                                            done();
                                        }
                                    );
                            });
                        });
                    });
                    
                    describe('invalid format on authorization header', function getRequest() {
                        it('should complain about wrong format', function it(done) {
                            request(sails.hooks.http.app)
                                .get(testCase.url)
                                .set('Authorization', 'foobar123')
                                .set('Content-Type', 'application/json')
                                .expect(401)
                                .end(
                                    function end(error, result) {
                                        if (error) {
                                            return done(error);
                                        }

                                        expect(result.res.body.message).to.equal('Invalid authorization header format. Format is Authorization: Bearer [token]');

                                        done();
                                    }
                                );
                        });
                    });

                    describe('authorization header with valid format', function getRequest() {
                        it('should complain about not valid authorization token', function it(done) {
                            request(sails.hooks.http.app)
                                .get(testCase.url)
                                .set('Authorization', 'bearer foobar123')
                                .set('Content-Type', 'application/json')
                                .expect(401)
                                .end(
                                    function end(error, result) {
                                        if (error) {
                                            return done(error);
                                        }

                                        expect(result.res.body.message).to.equal('Given authorization token is not valid');

                                        done();
                                    }
                                );
                        });
                    });
                });

                describe('GET ' + testCase.url + testCase.identifier, function getRequestTests() {
                    describe('no authorization header given', function withoutAuthorizationHeader() {
                        it('should complain about missing authorization header', function it(done) {
                            request(sails.hooks.http.app)
                                .get(testCase.url + testCase.identifier)
                                .set('Content-Type', 'application/json')
                                .expect(401)
                                .end(
                                    function end(error, result) {
                                        if (error) {
                                            return done(error);
                                        }

                                        expect(result.res.body.message).to.equal('No authorization header was found');

                                        done();
                                    }
                                );
                        });
                    });

                    describe('invalid format on authorization header', function getRequest() {
                        it('should complain about wrong format', function it(done) {
                            request(sails.hooks.http.app)
                                .get(testCase.url + testCase.identifier)
                                .set('Authorization', 'foobar123')
                                .set('Content-Type', 'application/json')
                                .expect(401)
                                .end(
                                    function end(error, result) {
                                        if (error) {
                                            return done(error);
                                        }

                                        expect(result.res.body.message).to.equal('Invalid authorization header format. Format is Authorization: Bearer [token]');

                                        done();
                                    }
                                );
                        });
                    });

                    describe('authorization header with valid format', function getRequest() {
                        it('should complain about not valid authorization token', function it(done) {
                            request(sails.hooks.http.app)
                                .get(testCase.url + testCase.identifier)
                                .set('Authorization', 'bearer foobar123')
                                .set('Content-Type', 'application/json')
                                .expect(401)
                                .end(
                                    function end(error, result) {
                                        if (error) {
                                            return done(error);
                                        }

                                        expect(result.res.body.message).to.equal('Given authorization token is not valid');

                                        done();
                                    }
                                );
                        });
                    });
                });

                describe('GET ' + testCase.url + 'count', function getRequestTests() {
                    describe('no authorization header given', function getRequest() {
                        it('should complain about missing authorization header', function it(done) {
                            request(sails.hooks.http.app)
                                .get(testCase.url + 'count')
                                .set('Content-Type', 'application/json')
                                .expect(401)
                                .end(
                                    function end(error, result) {
                                        if (error) {
                                            return done(error);
                                        }

                                        expect(result.res.body.message).to.equal('No authorization header was found');

                                        done();
                                    }
                                );
                        });
                    });

                    describe('invalid format on authorization header', function getRequest() {
                        it('should complain about wrong format', function it(done) {
                            request(sails.hooks.http.app)
                                .get(testCase.url + 'count')
                                .set('Authorization', 'foobar123')
                                .set('Content-Type', 'application/json')
                                .expect(401)
                                .end(
                                function end(error, result) {
                                    if (error) {
                                        return done(error);
                                    }

                                    expect(result.res.body.message).to.equal('Invalid authorization header format. Format is Authorization: Bearer [token]');

                                    done();
                                }
                            );
                        });
                    });

                    describe('authorization header with valid format', function getRequest() {
                        it('should complain about not valid authorization token', function it(done) {
                            request(sails.hooks.http.app)
                                .get(testCase.url + 'count')
                                .set('Authorization', 'bearer foobar123')
                                .set('Content-Type', 'application/json')
                                .expect(401)
                                .end(
                                    function end(error, result) {
                                        if (error) {
                                            return done(error);
                                        }

                                        expect(result.res.body.message).to.equal('Given authorization token is not valid');

                                        done();
                                    }
                                );
                        });
                    });
                });

                describe('POST ' + testCase.url, function postRequestTests() {
                    describe('no authorization header given', function postRequest() {
                        it('should complain about missing authorization header', function it(done) {
                            request(sails.hooks.http.app)
                                .post(testCase.url)
                                .set('Content-Type', 'application/json')
                                .send(testCase.data.identifier)
                                .expect(401)
                                .end(
                                    function end(error, result) {
                                        if (error) {
                                            return done(error);
                                        }

                                        expect(result.res.body.message).to.equal('No authorization header was found');

                                        done();
                                    }
                                );
                        });
                    });

                    describe('invalid format on authorization header', function postRequest() {
                        it('should complain about wrong format', function it(done) {
                            request(sails.hooks.http.app)
                                .post(testCase.url)
                                .set('Authorization', 'foobar123')
                                .set('Content-Type', 'application/json')
                                .send(testCase.data.identifier)
                                .expect(401)
                                .end(
                                    function end(error, result) {
                                        if (error) {
                                            return done(error);
                                        }

                                        expect(result.res.body.message).to.equal('Invalid authorization header format. Format is Authorization: Bearer [token]');

                                        done();
                                    }
                                );
                        });
                    });

                    describe('authorization header with valid format', function postRequest() {
                        it('should complain about not valid authorization token', function it(done) {
                            request(sails.hooks.http.app)
                                .post(testCase.url)
                                .set('Authorization', 'bearer foobar123')
                                .set('Content-Type', 'application/json')
                                .send(testCase.data.identifier)
                                .expect(401)
                                .end(
                                    function end(error, result) {
                                        if (error) {
                                            return done(error);
                                        }

                                        expect(result.res.body.message).to.equal('Given authorization token is not valid');

                                        done();
                                    }
                                );
                        });
                    });
                });

                describe('PUT ' + testCase.url  + testCase.identifier, function putRequestTests() {
                    describe('no authorization header given', function putRequest() {
                        it('should complain about missing authorization header', function it(done) {
                            request(sails.hooks.http.app)
                                .put(testCase.url + testCase.identifier)
                                .set('Content-Type', 'application/json')
                                .send(testCase.data.identifier)
                                .expect(401)
                                .end(
                                    function end(error, result) {
                                        if (error) {
                                            return done(error);
                                        }

                                        expect(result.res.body.message).to.equal('No authorization header was found');

                                        done();
                                    }
                                );
                        });
                    });

                    describe('invalid format on authorization header', function putRequest() {
                        it('should complain about wrong format', function it(done) {
                            request(sails.hooks.http.app)
                                .put(testCase.url  + testCase.identifier)
                                .set('Authorization', 'foobar123')
                                .set('Content-Type', 'application/json')
                                .send(testCase.data.identifier)
                                .expect(401)
                                .end(
                                    function end(error, result) {
                                        if (error) {
                                            return done(error);
                                        }

                                        expect(result.res.body.message).to.equal('Invalid authorization header format. Format is Authorization: Bearer [token]');

                                        done();
                                    }
                                );
                        });
                    });

                    describe('authorization header with valid format', function putRequest() {
                        it('should complain about not valid authorization token', function it(done) {
                            request(sails.hooks.http.app)
                                .put(testCase.url  + testCase.identifier)
                                .set('Authorization', 'bearer foobar123')
                                .set('Content-Type', 'application/json')
                                .send(testCase.data.identifier)
                                .expect(401)
                                .end(
                                    function end(error, result) {
                                        if (error) {
                                            return done(error);
                                        }

                                        expect(result.res.body.message).to.equal('Given authorization token is not valid');

                                        done();
                                    }
                                );
                        });
                    });
                });

                describe('DELETE ' + testCase.url  + testCase.identifier, function deleteRequestTests() {
                    describe('no authorization header given', function deleteRequest() {
                        it('should complain about missing authorization header', function it(done) {
                            request(sails.hooks.http.app)
                                .del(testCase.url + testCase.identifier)
                                .expect(401)
                                .end(
                                    function end(error, result) {
                                        if (error) {
                                            return done(error);
                                        }

                                        expect(result.res.body.message).to.equal('No authorization header was found');

                                        done();
                                    }
                                );
                        });
                    });

                    describe('invalid format on authorization header', function deleteRequest() {
                        it('should complain about wrong format', function it(done) {
                            request(sails.hooks.http.app)
                                .del(testCase.url  + testCase.identifier)
                                .set('Authorization', 'foobar123')
                                .expect(401)
                                .end(
                                    function end(error, result) {
                                        if (error) {
                                            return done(error);
                                        }

                                        expect(result.res.body.message).to.equal('Invalid authorization header format. Format is Authorization: Bearer [token]');

                                        done();
                                    }
                                );
                        });
                    });

                    describe('authorization header with valid format', function deleteRequest() {
                        it('should complain about not valid authorization token', function it(done) {
                            request(sails.hooks.http.app)
                                .del(testCase.url  + testCase.identifier)
                                .set('Authorization', 'bearer foobar123')
                                .expect(401)
                                .end(
                                    function end(error, result) {
                                        if (error) {
                                            return done(error);
                                        }

                                        expect(result.res.body.message).to.equal('Given authorization token is not valid');

                                        done();
                                    }
                                );
                        });
                    });
                });
            });

            describe('with valid headers', function withCorrectJwt() {
                var tokenDemo = '';
                var tokenAdmin = '';
                var createdRecordId = 0;

                before(function beforeTest(done) {
                    async.parallel(
                        {
                            tokenDemo: function getTokenDemo(next) {
                                login.authenticate('demo', function callback(error, result) {
                                    next(error, result.token);
                                });
                            },
                            tokenAdmin: function getTokenAdmin(next) {
                                login.authenticate('admin', function callback(error, result) {
                                    next(error, result.token);
                                });
                            }
                        },
                        function callback(error, results) {
                            tokenDemo = results.tokenDemo;
                            tokenAdmin = results.tokenAdmin;

                            done(error);
                        }
                    );
                });

                describe('GET ' + testCase.url, function findRecords() {
                    it('should return correct number of objects', function it(done) {
                        request(sails.hooks.http.app)
                            .get(testCase.url)
                            .set('Authorization', 'bearer ' + tokenDemo)
                            .set('Content-Type', 'application/json')
                            .expect(200)
                            .end(
                                function end(error, result) {
                                    if (error) {
                                        return done(error);
                                    }

                                    expect(result.res.body).to.be.a('array');
                                    expect(result.res.body).to.have.length(testCase.count);

                                    result.res.body.forEach(function(value) {
                                        expect(value).to.be.a('object');
                                    });


                                    done();
                                }
                            );
                    });
                });

                describe('GET ' + testCase.url + testCase.identifier, function findOneRecord() {
                    it('should return expected object', function it(done) {
                        request(sails.hooks.http.app)
                            .get(testCase.url + testCase.identifier)
                            .set('Authorization', 'bearer ' + tokenDemo)
                            .set('Content-Type', 'application/json')
                            .expect(200)
                            .end(
                                function end(error, result) {
                                    if (error) {
                                        return done(error);
                                    }

                                    expect(result.res.body).to.be.a('object');

                                    _.forEach(testCase.data.identifier, function iterator(value, key) {
                                        expect(result.res.body).to.have.property(key);

                                        if (_.isDate(value)) {
                                            value = value.toISOString();
                                        }

                                        expect(result.res.body[key]).to.equal(value);
                                    });

                                    done();
                                }
                            );
                    });
                });

                describe('GET ' + testCase.url + 666, function findOneRecord() {
                    it('should not return any data', function it(done) {
                        request(sails.hooks.http.app)
                            .get(testCase.url + 666)
                            .set('Authorization', 'bearer ' + tokenDemo)
                            .set('Content-Type', 'application/json')
                            .expect(404)
                            .end(
                                function end(error, result) {
                                    if (error) {
                                        return done(error);
                                    }

                                    expect(result.res.text).to.equal('No record found with the specified `id`.');

                                    done();
                                }
                            );
                    });
                });

                describe('GET ' + testCase.url + 'count', function findOneRecord() {
                    it('should return expected response', function it(done) {
                        request(sails.hooks.http.app)
                            .get(testCase.url + 'count')
                            .set('Authorization', 'bearer ' + tokenDemo)
                            .set('Content-Type', 'application/json')
                            .expect(200)
                            .end(
                                function end(error, result) {
                                    if (error) {
                                        return done(error);
                                    }

                                    expect(result.res.body).to.be.a('object');
                                    expect(result.res.body).to.deep.equal({count: testCase.count});

                                    done();
                                }
                            );
                    });
                });

                describe('POST ' + testCase.url, function createRecord() {
                    it('should create new record', function it(done) {
                        request(sails.hooks.http.app)
                            .post(testCase.url)
                            .set('Authorization', 'bearer ' + tokenAdmin)
                            .set('Content-Type', 'application/json')
                            .send(testCase.data.newRecord)
                            .expect(201)
                            .end(
                                function end(error, result) {
                                    if (error) {
                                        return done(error);
                                    }

                                    expect(result.res.body).to.be.a('object');

                                    _.forEach(testCase.data.newRecord, function iterator(value, key) {
                                        expect(result.res.body).to.have.property(key);

                                        if (_.isDate(value)) {
                                            value = value.toISOString();
                                        }

                                        expect(result.res.body[key]).to.equal(value);
                                    });

                                    createdRecordId = result.res.body.id;

                                    done();
                                }
                            );
                    });
                });

                describe('PUT ' + testCase.url + ' (created record)', function updateRecord() {
                    it('should update specified record', function it(done) {
                        var dataToUpdate = testCase.data.updateRecord || testCase.data.identifier;

                        request(sails.hooks.http.app)
                            .put(testCase.url + createdRecordId)
                            .set('Authorization', 'bearer ' + tokenAdmin)
                            .set('Content-Type', 'application/json')
                            .send(dataToUpdate)
                            .expect(200)
                            .end(
                                function end(error, result) {
                                    if (error) {
                                        return done(error);
                                    }

                                    expect(result.res.body).to.be.a('object');

                                    _.forEach(dataToUpdate, function iterator(value, key) {
                                        expect(result.res.body).to.have.property(key);

                                        if (_.isDate(value)) {
                                            value = value.toISOString();
                                        }

                                        expect(result.res.body[key]).to.equal(value);
                                    });

                                    expect(result.res.body.id).to.equal(createdRecordId);

                                    done();
                                }
                            );
                    });
                });

                describe('DELETE ' + testCase.url + ' (created record)', function deleteRecord() {
                    it('should delete specified record', function it(done) {
                        request(sails.hooks.http.app)
                            .del(testCase.url + createdRecordId)
                            .set('Authorization', 'bearer ' + tokenAdmin)
                            .expect(200)
                            .end(
                                function end(error, result) {
                                    if (error) {
                                        return done(error);
                                    }

                                    expect(result.res.body).to.be.a('object');

                                    var dataToUpdate = testCase.data.updateRecord || testCase.data.identifier;

                                    _.forEach(dataToUpdate, function iterator(value, key) {
                                        expect(result.res.body).to.have.property(key);

                                        if (_.isDate(value)) {
                                            value = value.toISOString();
                                        }

                                        expect(result.res.body[key]).to.equal(value);
                                    });

                                    expect(result.res.body.id).to.equal(createdRecordId);

                                    done();
                                }
                            );
                    });
                });
            });
        });
    });
});
