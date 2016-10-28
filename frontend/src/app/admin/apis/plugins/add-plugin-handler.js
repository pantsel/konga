/**
 * This file contains all necessary Angular controller definitions for 'frontend.admin.login-history' module.
 *
 * Note that this file should only contain controllers and nothing else.
 */
(function() {
    'use strict';

    angular.module('frontend.admin.apis')
        .service('AddPluginHandler', [
            '$log','BackendConfig','Upload','ApiService','KongPluginsService',
            function( $log,BackendConfig,Upload,ApiService,KongPluginsService) {


                var handlers  = {
                    common : function(apiId,data,success,error) {
                        ApiService.addPlugin(apiId,data)
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

                        return data;
                    }

                }
            }
        ])
    ;
}());
