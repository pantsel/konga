'use strict';

var _ = require("lodash")
var unirest = require('unirest')
var async = require('async')


var ConsumerCredentialsService = {

    add : function(consumer_id,type,value,cb) {
        sails.models.consumer
            .findOne(consumer_id)
            .exec(function(err,consumer){
                var credential = _.merge({type:type},{id:value.id})
                consumer.credentials.push(credential)
                consumer.save()
                return cb(null)
            })
    },

    remove : function(consumer_id,type,credential_id,cb) {
        sails.models.consumer
            .findOne(consumer_id)
            .exec(function(err,consumer){
                consumer.credentials.forEach(function(cred,index){
                    if(cred.type === type && cred.id === credential_id) {
                        consumer.credentials.splice(index, 1);
                        consumer.save()
                        return cb(null)
                    }
                })
            })
    },

    listCredentials : function(consumer_id,cb) {

        var credentials = ['jwt','key-auth','basic-auth','hmac-auth','oauth2']
        var promises = []

        credentials.forEach(function(credential){

            console.log(sails.config.kong_admin_url + '/consumers/' + consumer_id + "/" + credential)

            promises.push(function(cb) {
                unirest.get(sails.config.kong_admin_url + '/consumers/' + consumer_id + "/" + credential)
                    .end(function(response){
                        if(response.error) return  cb(response)
                        return cb(null,{
                            type : credential,
                            data : response.body.data,
                            total : response.body.total
                        })
                    })
            })
        })

        async.series(promises, function(err,result) {
            if (err) return cb(err)

            var obj = {}
            var sum_total = 0
            result.forEach(function(result){
                sum_total = sum_total + result.total
            })

            obj.credentials = result
            obj.total = sum_total

            return cb(null,obj)
        });

    },

}

module.exports = ConsumerCredentialsService
