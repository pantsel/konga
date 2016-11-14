'use strict';

var _ = require('lodash');
var KongaApiService = require('../services/KongaApiService')
var ConsumerService = require('../services/ConsumerService')


module.exports = function hook(sails) {
  return {

    process: function process(next) {


      if(!sails.config.expose_api) return next()

      var konga_api = {
        "name" : "konga",
        "request_path" : "/konga",
        "strip_request_path" : true,
        "preserve_host" : true,
        "upstream_url" : sails.config.konga_url + '/api',
        "plugins" : [{
          "name" : "key-auth",
          "config.key_names" : ["apiKey"]
        }]
      }

      var konga_api_consumer = {
        "username"  : "konga",
        "custom_id" : "konga",
        "acls" : ["konga"],
        "authorizations" : [,{
          "name" : "key-auth"
        }]
      }

      KongaApiService.apis.register(konga_api,function(err,api) {
        KongaApiService.consumers.create(konga_api_consumer,function(err,consumer){
          ConsumerService.sync(function(err,done){
            return next()
          })
        })
      })
    },

    /**
     * Method that runs automatically when the hook initializes itself.
     *
     * @param {Function}  next  Callback function to call after all is done
     */
    initialize: function initialize(next) {
      var self = this;

      // Wait for sails orm hook to be loaded
      sails.after('hook:orm:loaded', function onAfter() {
        self.process(next);
      });
    }
  };
};
