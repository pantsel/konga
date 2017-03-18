'use strict';

var unirest = require('unirest');
var _ = require('lodash');

var KongService = require('../services/KongService')
var ConsumerCredentialsService = require('../services/ConsumerCredentialsService')

var KongConsumerController  = _.merge(_.cloneDeep(require('../base/KongController')), {

    create : function(req,res) {

        var import_id;
        if(req.body.import_id) {
            //import_id = req.body.import_id
            delete req.body.import_id
        }
        KongService.createCb(req,res,function(error,consumer){
            if(error) return res.kongError(error)

            // Insert created consumer to Konga
            //consumer.import_id = import_id || ''
            //consumer.node_id = req.node_id
            //sails.models.consumer.create(consumer).exec(function (err, record) {
            //    if(err) return res.kongError(err)
            //    return res.json(record)
            //});

            return res.json(consumer)
        })
    },

    update : function(req,res) {
        KongService.updateCb(req,res,function(error,consumer){
            if(error) return res.kongError(error)

            return res.json(consumer);

            //// Update consumer Konga consumer
            //sails.models.consumer
            //    .update({id:req.params.id
            //    },{
            //        username: consumer.username,
            //        custom_id : consumer.custom_id
            //    }).exec(function afterwards(err, updated){
            //
            //    if(err) return res.kongError(err)
            //    return res.json(consumer);
            //});
        })
    },

    delete : function(req,res) {
        KongService.deleteCb(req,res,function(error,deleted){
            if(error) return res.kongError(error)

            return res.ok();

            //// Delete consumer from Konga
            //sails.models.consumer.destroy({
            //    id: req.params.id
            //}).exec(function (err){
            //    if(err) return res.kongError(err)
            //    console.log("Destroyed consumer with id " + req.params.id)
            //    return res.ok();
            //});
        })
    },

    createCredential : function(req,res) {
        unirest.post(sails.config.kong_admin_url + '/consumers/' + req.params.id + "/" + req.params.credential)
            .send(req.body)
            .end(function(response){
                if(response.error) return  res.kongError(response)

                return res.json(response.body)
            })
    },

    removeCredential : function(req,res) {
        unirest.delete(sails.config.kong_admin_url + '/consumers/' + req.params.id + "/" + req.params.credential + "/" + req.params.credential_id)
            .end(function(response){
                if(response.error) return  res.kongError(response)

                return res.json(response.body)
            })
    },

    listCredentials : function(req,res) {

        ConsumerCredentialsService.listCredentials(req.params.id,function(err,result){
            if(err) return res.negotiate(err)
            return res.json(result)
        })
    },



    retrieveCredentials : function(req,res) {
        unirest.get(sails.config.kong_admin_url + '/consumers/' + req.params.id + "/" + req.params.credential)
            .end(function(response){
                if(response.error) return  res.kongError(response)
                return res.json(response.body)
            })
    },

    addAcl : function(req,res) {
        unirest.post(sails.config.kong_admin_url + '/consumers/' + req.params.id + "/acls")
            .send({
                group : req.body.group
            })
            .end(function(response){
                if(response.error) return res.kongError(response);
                return res.json(response.body)
            })
    },

    retrieveAcls : function(req,res) {
        unirest.get(sails.config.kong_admin_url + '/consumers/' + req.params.id + "/acls")
            .end(function(response){
                if(response.error) return res.kongError(response);
                return res.json(response.body)
            })
    },

    deleteAcl : function(req,res) {
        unirest.delete(sails.config.kong_admin_url + '/consumers/' + req.params.id + "/acls/" + req.params.aclId)
            .end(function(response){
                if(response.error) return res.kongError(response);
                return res.json(response.body)
            })
    }
})
module.exports = KongConsumerController;
