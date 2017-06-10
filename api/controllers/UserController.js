'use strict';

var _ = require('lodash');

/**
 * UserController
 *
 * @description :: Server-side logic for managing Users
 * @help        :: See http://links.sailsjs.org/docs/controllers
 */
module.exports = _.merge(_.cloneDeep(require('../base/Controller')), {

    update : function(req,res) {

        console.log(req.body)

        var user = req.body;
        var passports = req.body.passports

        // Delete unwanted properties
        delete user.passports
        delete user.password_confirmation


        sails.models.user
            .update({id : req.param('id')},user)
            .exec(function(err,updatedUser){
                if(err) return res.negotiate(err);

                if(!passports) return res.json(updatedUser)

                sails.models.passport
                    .update({user:req.param('id')},{password:passports.password})
                    .exec(function(err,updatedPassport){
                        if(err) return res.negotiate(err);
                        return  res.json(updatedUser)
                    })



        })
    }
});
