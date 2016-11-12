'use strict';

var unirest = require("unirest")
var async= require('async')


var KongaApiService = {

    createConsumer: function (req, cb) {

        var consumer = {}
        unirest.post(sails.config.kong_admin_url + '/consumers')
            .send({
                username  : req.body.username,
                custom_id : req.body.custom_id
            })
            .end(function (response) {
                if (response.error)  {
                    if(response.body) {
                        response.body.path = "consumer"
                        response.body.obj = {
                            username  : req.body.username,
                            custom_id : req.body.custom_id
                        }
                    }

                    return cb(response)
                }

                consumer = response.body

                KongaApiService
                    .addConsumerAcls(consumer.id,req.body.acls,function(err,result){
                        if(err) {
                            KongaApiService
                                .deleteConsumer(consumer.id,function(error,ok){})
                            return cb(err)
                        }
                        consumer.acls = result

                        KongaApiService
                            .addConsumerAuthorizations(consumer.id,req.body.authorizations,function(err,auths){
                                if(err) {
                                    KongaApiService
                                        .deleteConsumer(consumer.id,function(error,ok){})
                                    return cb(err)
                                }
                                consumer.autorizations = auths
                                return cb(null,consumer)

                        })
                })
            })
    },

    deleteConsumer : function(consumer_id,cb) {
        unirest.delete(sails.config.kong_admin_url + '/consumers/' + consumer_id)
            .end(function (response) {
                if (response.error) return cb(response)
                return cb(null,response.body)
            })
    },

    addConsumerAcls: function (consumer_id,acls, cb) {
        if(!acls || !acls.length) return cb(null,{})

        var promises = []

        acls.forEach(function(acl) {
            promises.push(function (callback) {
                unirest.post(sails.config.kong_admin_url + '/consumers/' + consumer_id + "/acls")
                    .send({
                        group : acl
                    })
                    .end(function(response){
                        if(response.error) {
                            if(response.body) {
                                response.body.path = "acls"
                                response.body.obj = acl
                            }

                            return callback(response);
                        }
                        return callback(null,response.body)
                    })
            })
        })

        async.series(promises, function(err,result) {
            if (err) return cb(err)
            return cb(null,result)
        });


    },

    addConsumerAuthorizations: function (consumer_id,authorizations, cb) {
        if(!authorizations || !authorizations.length) return cb(null,{})
        var promises = []
        var _authorizations = {}

        authorizations.forEach(function(auth) {
            promises.push(function (callback) {
                unirest.post(sails.config.kong_admin_url + '/consumers/' + consumer_id + "/" + auth.name)
                    .send(auth.config || {})
                    .end(function (response) {

                        if (response.error) {
                            if(response.body) {
                                response.body.path = "authorizations"
                                response.body.obj = auth
                            }

                            return callback(response)
                        }

                        if(!_authorizations[auth.name]) _authorizations[auth.name] = []
                        _authorizations[auth.name].push(response.body)

                        return callback(null, response.body)
                    })
            })
        })

        async.series(promises, function(err,result) {
            if (err) return cb(err)
            return cb(null,_authorizations)
        });


    }

}

module.exports = KongaApiService
