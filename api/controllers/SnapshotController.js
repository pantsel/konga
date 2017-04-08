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
            if(err) res.negotiate(err)
            if(!node) res.badRequest({
                message : "Invalid Kong Node"
            })


            var result = {}

            var endpoints = ['/apis','/plugins']

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
                        kong_version : node.kong_version,
                        data : result
                    }).exec(function(err,created){
                        if(err) return res.negotiate(err)
                        return res.json(created)
                    })
                }
            });

        })
    },


    restore : function(req,res) {

        var snaphsot_id = req.params.id
        var target_node = req.body.kong_admin_url
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
                            KongService.createFromEndpointCb("/" + key,item,function(err,created){
                                if(!responseData[key]) {
                                    responseData[key] = {
                                        imported : 0,
                                        failed : 0
                                    }
                                }

                                if(err) {
                                    responseData[key].failed++
                                    return cb()
                                }
                                responseData[key].imported++
                                return cb(null,created)
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

