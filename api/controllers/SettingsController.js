'use strict';

var _ = require('lodash');

/**
 * UserController
 *
 * @description :: Server-side logic for managing Users
 * @help        :: See http://links.sailsjs.org/docs/controllers
 */
module.exports = _.merge(_.cloneDeep(require('../base/Controller')), {

    find : function(req,res) {

        // ToDo cache settings to memory
        //if(sails.KONGA_CONFIG) {
        //    console.log("Serving KONGA_CONFIG from memory")
        //    return res.json(sails.KONGA_CONFIG)
        //}

        sails.models.settings.find().limit(1)
            .exec(function(err,settings){

                if(err) return res.negotiate(err)
                // Store settings in memory
                sails.KONGA_CONFIG = settings[0].data || {}
                return res.json(settings[0] ? settings[0] : {})
            })
    }
});
