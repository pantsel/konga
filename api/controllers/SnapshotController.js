/**
 * SnapshotController
 *
 * @description :: Server-side logic for managing snapshots
 * @help        :: See http://sailsjs.org/#!/documentation/concepts/Controllers
 */

var KongService = require('../services/KongService')
var _ = require('lodash')
var async = require('async');

module.exports = _.merge(_.cloneDeep(require('../base/Controller')), {

    takeSnapShot : function(req,res) {


        // Get node
        sails.models.kongnode.findOne({
            id : req.param("node_id")
        }).exec(function(err,node){
            if(err) return res.negotiate(err)
            if(!node) return res.badRequest({
                message : "Invalid Kong Node"
            })



            var result = {}

            var endpoints = ['/apis','/plugins','/consumers']

            if(node.kong_version == '0-10-x') {
                endpoints = endpoints.concat(['/upstreams'])
            }

            var fns = []

            endpoints.forEach(function(endpoint){
                fns.push(function(cb){
                    KongService.listAllCb(req,endpoint,function(err,data){
                        if(err) return cb(err)
                        console.log(data.data)
                        result[endpoint.replace("/","")] = data.data
                        return cb()
                    })
                })
            })


            async.series(fns,function(err,data){
                if(err) return res.negotiate(err)


                // Foreach consumer get it's acls
                var consumerFns = []
                result.consumers.forEach(function(consumer){
                    consumerFns.push(function(cb){
                        KongService.listAllCb(req,'/consumers/' + consumer.id + '/acls',function(err,data){
                            if(err) return cb()
                            console.log(data)
                            if(!consumer.acls) consumer.acls = []
                            data.data.forEach(function(item){
                                consumer.acls.push(item)
                            })

                            return cb()
                        })
                    })


                    var credentials = ["basic-auth","key-auth","hmac-auth","jwt","oauth2"]
                    credentials.forEach(function(credential){
                        consumerFns.push(function(cb){
                            KongService.listAllCb(req,'/consumers/' + consumer.id + '/' + credential,function(err,data){
                                if(err) return cb()
                                console.log(data)
                                if(!consumer.credentials) consumer.credentials = {}
                                if(!consumer.credentials[credential]) consumer.credentials[credential] = []
                                data.data.forEach(function(item){
                                    consumer.credentials[credential].push(item)
                                })

                                return cb()
                            })
                        })
                    })
                })

                async.series(consumerFns,function(err,data) {
                    if (err) return res.negotiate(err)

                    if(node.kong_version == '0-10-x') {
                        // Foreach upstream get its targets
                        var fns = []
                        result.upstreams.forEach(function(upstream){
                            fns.push(function(cb){
                                KongService.listAllCb(req,'/upstreams/' + upstream.id + '/targets',function(err,data){
                                    if(err) return cb()
                                    console.log(data.data)
                                    if(!result.upstream_targets) result.upstream_targets = []
                                    data.data.forEach(function(item){
                                        result.upstream_targets.push(item)
                                    })

                                    return cb()
                                })
                            })
                        })



                        async.series(fns,function(err,data){
                            if(err) return res.negotiate(err)


                            sails.models.snapshot.create({
                                name : req.param("name"),
                                kong_node_name :  node.name,
                                kong_node_url : node.kong_admin_url,
                                kong_version : node.kong_version,
                                data : result
                            }).exec(function(err,created){
                                if(err) return res.negotiate(err)
                                return res.json(created)
                            })
                        })
                    }else{
                        sails.models.snapshot.create({
                            name : req.param("name"),
                            kong_node_name :  node.name,
                            kong_version : node.kong_version,
                            data : result
                        }).exec(function(err,created){
                            if(err) return res.negotiate(err)
                            return res.json(created)
                        })
                    }
                })



            });

        })
    },


    restore : function(req,res) {

        var snaphsot_id = req.params.id
        var responseData = {

        }

        sails.models.snapshot.findOne({
            id : snaphsot_id
        }).exec(function(err,snapshot){
            if(err) return res.negotiate(err)
            if(!snapshot) res.badInput({
                message : 'Invalid snaphot'
            })

            var fns = []
            var imports = req.param("imports") || Object.keys(snapshot.data)
            imports.forEach(function(key){

                //if(key != 'upstream_targets' && key != 'upstreams') {
                    snapshot.data[key].forEach(function(item){
                        fns.push(function(cb){

                            // For consumers, we need to import their acls and credentials as well

                            var consumerAcls = []
                            var consumerCredentials = []

                            if(key == "consumers") {

                                // Clean up the consumer object, by storing acls and credentials in different variables
                                consumerAcls = _.cloneDeep(item.acls)
                                consumerCredentials = _.cloneDeep(item.credentials)

                                delete item.acls
                                delete item.credentials

                                console.log("item",item)

                            }


                            KongService.createFromEndpointCb("/" + key,item,function(err,created){

                                if(!responseData[key]) {
                                    responseData[key] = {
                                        imported : 0,
                                        failed : {
                                            count : 0,
                                            items : []
                                        }
                                    }
                                }

                                if(err) {
                                    responseData[key].failed.count++
                                    if(responseData[key].failed.items.indexOf(item.name) < 0) {
                                        responseData[key].failed.items.push(item.name)
                                    }
                                    return cb()
                                }


                                if(key == 'consumers') {
                                    var consumerFns = []
                                    // Import acls
                                    consumerAcls.forEach(function(acl){
                                        consumerFns.push(function(cb){
                                            KongService.createFromEndpointCb("/" + key + "/" + item.id + "/acls",acl,function(err,created){

                                                if(err) {
                                                    responseData[key].failed.count++
                                                    if(responseData[key].failed.items.indexOf(item.name) < 0) {
                                                        responseData[key].failed.items.push(item.name)
                                                    }
                                                    return cb()
                                                }
                                                return cb()

                                            });
                                        })
                                    })


                                    // Import credentials
                                    Object.keys(consumerCredentials).forEach(function(credentialKey){

                                        credentialKey,consumerCredentials[credentialKey].forEach(function(credentialData){
                                            consumerFns.push(function(cb){
                                                KongService.createFromEndpointCb("/" + key + "/" + item.id + "/" + credentialKey,credentialData,function(err,created){

                                                    if(err) {
                                                        responseData[key].failed.count++
                                                        if(responseData[key].failed.items.indexOf(item.name) < 0) {
                                                            responseData[key].failed.items.push(item.name)
                                                        }
                                                        return cb()
                                                    }
                                                    return cb()

                                                });
                                            })
                                        })

                                    })
                                }

                                async.series(consumerFns,function(err,data){
                                    responseData[key].imported++
                                    return cb(null,data)
                                })
                            })
                        })
                    })
                //}
            })


            async.series(fns,function(err,data){
                if(err) return res.negotiate(err)
                return res.ok(responseData)
            })

        })
    }

});

