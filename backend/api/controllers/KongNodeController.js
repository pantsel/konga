'use strict';

var _ = require('lodash');

/**
 * UserController
 *
 * @description :: Server-side logic for managing Users
 * @help        :: See http://links.sailsjs.org/docs/controllers
 */
module.exports = _.merge(_.cloneDeep(require('../base/Controller')), {

    update : function(req,res){
        sails.models.kongnode.findOne({id:req.params.id}).exec(function afterwards(err, node){

            if (err) return res.negotiate(err);
            sails.models.kongnode.update({id:req.params.id},req.body).exec(function afterwards(err, resp){

                if (err) return res.negotiate(err);
                if(req.body.active && node.active != req.body.active) {
                    sails.models.kongnode.update({
                        where: { id:{ '!': req.params.id } },

                    },{active:false}).exec(function afterwards(err, upd){
                        if (err) return res.negotiate(err);
                        return  res.json(upd)
                    })
                }else{
                    return  res.json(resp)
                }
            });
        });

    }
});
