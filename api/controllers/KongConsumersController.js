
var _ = require('lodash');
var fs = require('fs');
var PluginService = require('../services/KongPluginService');
var Kong = require("../services/KongService");
var async = require("async");

var KongConsumersController  =  {

    apis : function(req,res) {

        var consumerId = req.param("id");

        console.log(req.node_id);

        Kong.listAllCb(req,'/consumers/' + consumerId + '/acls', function (err,_acls) {
            if(err) return res.negotiate(err);

            var consumerGroups = _.map(_acls.data,function(item){
                return item.group;
            })

            Kong.listAllCb(req,'/apis',function (err,data) {
                if(err) return res.negotiate(err);

                var apis = data.data;

                var apiPluginsFns = [];

                apis.forEach(function(api){

                    // Add consumer id
                    api.consumer_id = consumerId;

                    apiPluginsFns.push(function(cb){
                        return Kong.listAllCb(req,'/apis/' + api.id + '/plugins',cb);
                    });
                });


                async.series(apiPluginsFns,function (err,data) {
                    if(err) return res.negotiate(err);

                    data.forEach(function(plugins,index){

                        var acl = _.find(plugins.data,function(item){
                            return item.name === "acl" && item.enabled === true;
                        });

                        if(acl) {
                            apis[index].acl = acl;
                        }

                        apis[index].plugins = plugins;
                    });


                    var open =  _.filter(apis,function (api) {
                        return !api.acl;
                    })


                    var whitelisted = _.filter(apis,function (api) {
                        return api.acl && _.intersection(api.acl.config.whitelist,consumerGroups).length > 0;
                    });


                    return res.json({
                        total : open.length + whitelisted.length,
                        data  : open.concat(whitelisted)
                    });
                });
            });
        });

    }


};

module.exports = KongConsumersController;
