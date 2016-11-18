'use strict';

var _ = require("lodash")
var unirest = require('unirest')
var async = require('async')


var ConsumerCredentialsService = {

    listCredentials : function(consumer_id,cb) {

        var credentials = ['jwt','key-auth','basic-auth','hmac-auth','oauth2']
        var promises = []

        credentials.forEach(function(credential){

            promises.push(function(cb) {
                unirest.get(sails.config.kong_admin_url + '/consumers/' + consumer_id + "/" + credential)
                    .end(function(response){
                        if(response.error) return  cb({
                            status : response.error.status,
                            message : response.body.message
                        })
                        return cb(null,{
                            name : credential,
                            data : response.body.data,
                            total : response.body.total
                        })
                    })
            })
        })

        async.series(promises, function(err,result) {
            if (err) return cb(err)

            var obj = {
                credentials : []
            }
            var sum_total = 0
            result.forEach(function(result){
                sum_total = sum_total + result.total
                if(result.total > 0) obj.credentials.push(result)
            })


            obj.total = sum_total

            return cb(null,obj)
        });

    },

}

module.exports = ConsumerCredentialsService
