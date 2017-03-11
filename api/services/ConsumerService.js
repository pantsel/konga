'use strict';

var _ = require("lodash")
var unirest = require('unirest')
var async = require('async')


var ConsumerService = {

    sync : function(cb) {
        var handleConsumers = function (kongConsumers) {
            sails.models.consumer.find({})
                .exec(function (err, consumers) {
                    if (err) return cb(err)

                    sails.log.debug('ConsumerService:sync => Konga consumers',consumers);

                    // Find the consumers that only exist in Kong's db
                    var onlyInKong = kongConsumers.filter(function (current) {
                        return consumers.filter(function (current_b) {
                                return current_b.username == current.username
                            }).length == 0
                    });

                    // Find the consumers that only exists in Konga's db
                    var onlyInKonga = consumers.filter(function (current) {
                        return kongConsumers.filter(function (current_a) {
                                return current_a.username == current.username
                            }).length == 0
                    });

                    async.series([
                        function (callback) {
                            sails.models.consumer.create(onlyInKong)
                                .exec(function (err, docs) {
                                    if (err) return callback(err)
                                    return callback()
                                })
                        },
                        function (callback) {
                            sails.log.info('Deleting absent consumers from Konga');
                            var ids = onlyInKonga.map(function (item) {
                                return item.id
                            })

                            sails.models.consumer.destroy({
                                id: ids
                            }).exec(function (err) {
                                if (err) return callback(err)
                                return callback()
                            });
                        }
                    ], function (err) {
                        if (err) return cb(err)
                        return cb(null,true);
                    });

                })

        };
        var getConsumers = function (prevConsumers,url) {
            unirest.get(url)
                .end(function(response) {
                    if (response.error) return cb(response);
                    var kongConsumers = prevConsumers.concat(response.body.data);
                    if (response.body.next) {
                        getConsumers(kongConsumers,response.body.next);
                    }
                    else {
                        handleConsumers(kongConsumers);
                    }

                });
        };
        getConsumers([],sails.config.kong_admin_url + '/consumers');
    }
}

module.exports = ConsumerService
