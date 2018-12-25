

var HealthCheckEvents = require("../events/upstream-health-checks")



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

        sails.log("Hook:upstream_health_checks:process() called")

        // Start health checks for all eligible nodes
        sails.models.upstreamalert.find({
         active: true
        })
            .exec(function(err,hcs){
                if(!err && hcs.length){
                    hcs.forEach(function(hc){
                        HealthCheckEvents.start(hc)
                    })
                }
            })

        HealthCheckEvents.addListener('upstream.health_checks.start', function(hc){
            sails.log("Hook:upstream_health_checks:on:upstream.health_checks.start",hc)
            HealthCheckEvents.start(hc)

        });


        HealthCheckEvents.addListener('upstream.health_checks.stop', function(hc){
            sails.log("Hook:upstream_health_checks:on:upstream.health_checks.stop",hc)
            HealthCheckEvents.stop(hc)
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
