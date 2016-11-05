/**
 * This file contains all necessary Angular controller definitions for 'frontend.admin.login-history' module.
 *
 * Note that this file should only contain controllers and nothing else.
 */
(function() {
    'use strict';

    angular.module('frontend.admin.apis')
        .service('AddPluginHelper', [
            '$log','BackendConfig','Upload','PluginService','KongPluginsService',
            function( $log,BackendConfig,Upload,PluginService,KongPluginsService) {

                function parseFields(schema,path,output) {
                    angular.forEach(schema.fields, function(value, key) {
                        var _path = path ? path + "." + key : "config." + key;
                        if(value.schema) {
                            parseFields(value.schema,_path,output)
                        }else{
                            output[_path] = value
                        }
                    });
                }

                var handlers  = {
                    common : function(apiId,data,success,error) {

                        PluginService.addPlugin(apiId,data)
                            .then(function(resp){
                                success(resp)
                            }).catch(function(err){
                            error(err)
                        })
                    },
                    ssl : function(apiId,data, success,error,event) {
                        var files = [];

                        files.push(data['config.cert'])
                        files.push(data['config.key'])

                        Upload.upload({
                            url: BackendConfig.url + '/kong/apis/' + apiId + '/plugins',
                            arrayKey: '',
                            data: {
                                file: files,
                                'name' : data.name,
                                'config.only_https': data['config.only_https'],
                                'config.accept_http_if_already_terminated': data['config.accept_http_if_already_terminated']
                            }
                        }).then(function (resp) {
                            success(resp)
                        }, function (err) {
                            error(err)
                        }, function (evt) {
                            event(evt)
                        });
                    }
                }

                return {
                    add : function(apiId,data, success,error,event) {

                        if(handlers[data.name]) {
                            return handlers[data.name](apiId,data, success,error,event)
                        }else{
                            return handlers['common'](apiId,data, success,error,event)
                        }
                    },

                    makeData : function(plugin) {

                        var data = {
                            name : plugin.name
                        }

                        for(var key in plugin.options) {
                            if(plugin.name == 'datadog' && key == 'config.metrics') { // fix for datadog's metrics

                                try{
                                    data[key] = plugin.options[key].value.join(",")
                                }catch(err){
                                    data[key] = null
                                }

                            }else{
                                data[key] = plugin.options[key].value
                            }
                        }

                        // Add consumer if defined
                        if(plugin.consumer) {
                            data.consumer_id = plugin.consumer.id
                        }

                        return data;
                    },

                    createFields : function(schema,path) {
                        var output = {}

                        parseFields(schema,path,output)

                        return output
                    }

                }
            }
        ])
    ;
}());
