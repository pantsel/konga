

var HealthCheckEvents = require("../events/node-health-checks")
var cron = require('node-cron');



/**
 * load-db.js
 *
 * This file contains a custom hook, that will be run after sails.js orm hook is loaded. Purpose of this hook is to
 * check that database contains necessary initial data for application.
 */
module.exports = function hook(sails) {
  return {
    /**
     * Private hook method to subscribe to health check events
     *
     * @param {Function}  next  Callback function to call after all is done
     */
    process: function process(next) {

        sails.log("Hook:health_checks:process() called")

        // Start health checks for all eligible nodes
        sails.models.kongnode.find({})
            .exec(function(err,nodes){
                if(!err && nodes.length){
                    nodes.forEach(function(node){
                        if(node.health_checks) HealthCheckEvents.start(node)
                    })
                }
            })

        HealthCheckEvents.addListener('health_checks.start', function(node){
            //sails.log("Hook:health_checks:on:health_checks.start",node)
            HealthCheckEvents.start(node)

        });


        HealthCheckEvents.addListener('health_checks.stop', function(node){
            //sails.log("Hook:health_checks:on:health_checks.stop",node)
            HealthCheckEvents.stop(node)
        });

        next()

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
