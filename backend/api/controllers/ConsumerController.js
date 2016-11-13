'use strict';
var _ = require('lodash')
var ConsumerService = require('../services/ConsumerService')

/**
 * UserController
 *
 * @description :: Server-side logic for managing Users
 * @help        :: See http://links.sailsjs.org/docs/controllers
 */
module.exports = _.merge(_.cloneDeep(require('../base/Controller')), {

    /**
     * Sync Kong's consumers with Konga
     * @param req
     * @param res
     */
    sync : function(req,res) {
        ConsumerService.sync(function(err,ok){
            if (err) return res.kongError(err)
            return res.ok()
        })
    }
});
