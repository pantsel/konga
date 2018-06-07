

var SnapshotScheduler = require("../services/SnapshotsScheduler");



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

        sails.log("Hook:start-scheduled-snapshots:process() called")

        // Start health checks for all eligible nodes
        sails.models.snapshotschedule.find({
            active : true
        })
            .exec(function(err,data){
                if(!err && data.length){
                    data.forEach(function(schedule){
                        SnapshotScheduler.add(schedule);
                    });
                }
            });


        next();

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
