/**
 * This file contains all necessary Angular controller definitions for 'frontend.admin.login-history' module.
 *
 * Note that this file should only contain controllers and nothing else.
 */
(function() {
    'use strict';

    angular.module('frontend.plugins')
        .service('PluginHelperService', [
            '_','$log','BackendConfig','Upload','PluginsService',
            function( _,$log,BackendConfig,Upload,PluginsService) {

                function assignExtraProperties(_pluginName, options,fields,prefix) {
                    Object.keys(fields).forEach(function (item) {
                        if(fields[item].schema) {
                            assignExtraProperties(_pluginName, options,fields[item].schema.fields,item);
                        } else if (fields[item].fields){
                            assignExtraProperties(_pluginName, options,fields[item].fields,item);
                        } else {
                            var path = prefix ? prefix + "." + item : item;
                            var value = fields[item].default;

                            if ((fields[item].type === 'array' || fields[item].type === 'set')
                                && (typeof value === 'object' || typeof value === 'string')
                                && _pluginName !== 'statsd'
                            ) {
                                value = [];
                            }
                            fields[item].value = value
                            fields[item].help = _.get(options,path) ? _.get(options,path).help : '';
                        }
                    });
                }

                function createConfigProperties(pluginName,fields,prefix,data) {
                    Object.keys(fields).forEach(function (key) {
                        if(fields[key].schema) {
                            createConfigProperties(pluginName,fields[key].schema.fields,key,data);
                        }else{
                            var path = prefix ? prefix + "." + key : key;
                            // if (fields[key].value instanceof Array && pluginName !== 'statsd') {
                            //     // Transform to comma separated string
                            //     // data['config.' + path] = fields[key].value.join(",");
                            //     if(!data.config) data.config = {};
                            //     if(fields[key].value) {
                            //         data.config[path] = fields[key].value.join(",");
                            //     }
                            // } else {
                            //     // data['config.' + path] = fields[key].value;
                            //     if(!data.config) data.config = {};
                            //     if(fields[key].value) {
                            //         data.config[path] = fields[key].value;
                            //     }
                            // }

                            if (fields[key].value instanceof Array
                                && fields[key].elements.type === "integer") {
                                fields[key].value = fields[key].value.map(function(value) {
                                    return parseInt(value);
                                });
                            }

                            if(!data.config) data.config = {};

                            if(fields[key].fields) {
                                fields[key].fields.forEach(field => {
                                    if(!data.config[path]) data.config[path] = {};
                                    const prop = Object.keys(field)[0];
                                    data.config[path][Object.keys(field)[0]] = _.get(field, `${prop}.value`);
                                    if(field[prop].type === "integer") data.config[path][Object.keys(field)[0]] = Number(data.config[path][Object.keys(field)[0]])
                                    if(field[prop].type === "array") {
                                        if (field[prop].elements.type === "integer" && data.config[path][Object.keys(field)[0]] !== undefined) data.config[path][Object.keys(field)[0]] = data.config[path][Object.keys(field)[0]].map(v => Number(v))
                                    }
                                })
                            }else{
                                if(fields[key].value !== ""
                                  && fields[key].value !== null
                                  && fields[key].value !== 'undefined'
                                  && fields[key].value !== undefined) {
                                    data.config[path] = fields[key].value;
                                }
                            }


                        }
                    });

                }

                var handlers  = {
                    common : function(data,success,error) {

                        PluginsService.add(data)
                            .then(function(resp){
                                success(resp);
                            }).catch(function(err){
                            error(err);
                        });
                    },
                    ssl : function(data, success,error,event) {
                        var files = [];

                        files.push(data['config.cert'])
                        files.push(data['config.key'])

                        Upload.upload({
                            url: 'kong/plugins',
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
                    addPlugin : function(data, success,error,event) {

                        if(handlers[data.name]) {
                            return handlers[data.name](data, success,error,event);
                        }else{
                            return handlers['common'](data, success,error,event);
                        }
                    },

                    createConfigProperties : function(pluginName,fields,prefix) {
                        var output = {}
                        createConfigProperties(pluginName,fields,prefix,output)
                        return output;
                    },

                    assignExtraProperties : function(_pluginName, options,fields,prefix) {
                        return  assignExtraProperties(_pluginName, options,fields,prefix)
                    },

                    /**
                     * Customize data fields for specified plugins if required by Konga's logic
                     * @param pluginName
                     * @param fields
                     */
                    customizeDataFieldsForPlugin : function(pluginName,fields) {

                        switch (pluginName) {
                            case 'ssl':
                                fields.cert.type = 'file'
                                fields.key.type = 'file'
                                break;
                        }
                    },

                    /**
                     * Mutate request data for specified plugins if required by Konga's logic
                     * @param request_data
                     * @param fields
                     */
                    applyMonkeyPatches : function(request_data,fields) {
                        if(request_data.name === 'response-ratelimiting'
                            && fields.limits.custom_fields) {
                            //console.log("fields.limits.custom_fields",fields.limits.custom_fields)
                            Object.keys(fields.limits.custom_fields)
                                .forEach(function(key){
                                    Object.keys(fields.limits.custom_fields[key])
                                        .forEach(function(cf_key){
                                            request_data['config.limits.' + key + '.' + cf_key] = fields.limits.custom_fields[key][cf_key].value

                                        });
                                });
                        }
                    }

                };
            }
        ])
    ;
}());
