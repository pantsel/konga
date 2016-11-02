'use strict';

var _ = require('lodash');
var unirest = require('unirest')

/**
 * UserController
 *
 * @description :: Server-side logic for managing Users
 * @help        :: See http://links.sailsjs.org/docs/controllers
 */
module.exports = _.merge(_.cloneDeep(require('../base/Controller')), {

    sync : function(req,res) {

        // ToDo using async
        console.log("sails.config.kong_admin_url",sails.config.kong_admin_url)
        unirest.get(sails.config.kong_admin_url + '/consumers')
            .end(function (response) {
                if (response.error) return res.kongError(response)

                var kongConsumers = response.body.data

                sails.models.consumer.find({})
                    .exec(function(err,consumers){
                        if (err) return res.negotiate(err)


                        var onlyInKong = kongConsumers.filter(function(current){
                            return consumers.filter(function(current_b){
                                    return current_b.username == current.username
                                }).length == 0
                        });

                        console.log("onlyInKong",onlyInKong)

                        var onlyInKonga = consumers.filter(function(current){
                            return kongConsumers.filter(function(current_a){
                                    return current_a.username == current.username
                                }).length == 0
                        });

                        if(onlyInKong.length) {
                            sails.models.consumer.create(onlyInKong)
                                .exec(function(err,docs){
                                    if (err) return res.negotiate(err)

                                    // ToDo delete the onlyInKonga records

                                    if(onlyInKonga.length) {
                                        var ids = onlyInKonga.map(function(item){
                                            return item.id
                                        })
                                        sails.models.consumer.destroy({
                                            id: ids
                                        }).exec(function (err){
                                            if (err) {
                                                return res.negotiate(err);
                                            }
                                            return res.ok();
                                        });
                                    }else{
                                        return res.json(docs)
                                    }

                                })
                        }else if(onlyInKonga.length) {
                            var ids = onlyInKonga.map(function(item){
                                return item.id
                            })
                            sails.models.consumer.destroy({
                                id: ids
                            }).exec(function (err){
                                if (err) {
                                    return res.negotiate(err);
                                }
                                return res.ok();
                            });
                        }else {

                            return res.ok();
                        }



                    })

            })
    }
});
