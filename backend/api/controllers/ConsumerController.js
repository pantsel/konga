'use strict';

var _ = require('lodash');
var unirest = require('unirest')
var async = require('async')

/**
 * UserController
 *
 * @description :: Server-side logic for managing Users
 * @help        :: See http://links.sailsjs.org/docs/controllers
 */
module.exports = _.merge(_.cloneDeep(require('../base/Controller')), {

    sync : function(req,res) {

        unirest.get(sails.config.kong_admin_url + '/consumers')
            .end(function (response) {
                if (response.error) return res.kongError(response)

                var kongConsumers = response.body.data

                sails.models.consumer.find({})
                    .exec(function(err,consumers){
                        if (err) return res.negotiate(err)

                        // Find the consumers that only exist in Kong's db
                        var onlyInKong = kongConsumers.filter(function(current){
                            return consumers.filter(function(current_b){
                                    return current_b.username == current.username
                                }).length == 0
                        });

                        // Find the consumers that only exists in Konga's db
                        var onlyInKonga = consumers.filter(function(current){
                            return kongConsumers.filter(function(current_a){
                                    return current_a.username == current.username
                                }).length == 0
                        });

                        async.series([
                            function(callback) {
                                sails.log.info('Importing Kong\'s consumers in Konga]');

                                // Add node_id property
                                onlyInKong.forEach(function(consumer){
                                    consumer.node_id = req.node_id
                                })

                                sails.models.consumer.create(onlyInKong)
                                    .exec(function(err,docs){
                                        if (err) return callback(err)
                                        return callback()
                                    })
                            },
                            function(callback) {
                                sails.log.info('Deleting absent consumers from Konga');
                                var ids = onlyInKonga.map(function(item){
                                    return item.id
                                })
                                sails.models.consumer.destroy({
                                    id: ids
                                }).exec(function (err){
                                    if (err) return callback(err)
                                    return callback()
                                });
                            }
                        ], function(err) {
                            if (err) return res.negotiate(err)
                            return res.ok();
                        });

                    })

            })
    }
});
