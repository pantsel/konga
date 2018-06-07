'use strict';

var _ = require('lodash');
var cron = require('node-cron');

module.exports = _.merge(_.cloneDeep(require('../base/Controller')), {



    create : function (req,res) {


        // Validate cron
        if(!cron.validate(req.body.cron)) {
            return res.badRequest({
                message : "Cron parameters are not valid",
                fields : ["cron"]
            });
        }

        // Check if another schedule using the defined
        // connection already exists.
        sails.models.snapshotschedule.find({
            connection : req.body.connection
        }).exec(function(err,results){
            if(err) {
                return res.negotiate(err);
            }

            if(results && results.length > 0) {
                return res.badRequest({
                    message : "A schedule for the defined connection already exists",
                    fields : ["connection"]
                });
            }


            sails.models.snapshotschedule.create(req.body)
                .exec(function (err,created) {
                    if(err) {
                        return res.negotiate(err);
                    }


                    if(created.active) { // Start cron job immediately

                    }

                    return res.json(created);
                });
        });





    }
});
