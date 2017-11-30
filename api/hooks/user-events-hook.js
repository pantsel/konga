

var userEvents = require("../events/user-events")



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

        sails.log("Hook:user_events_hook:process() called")


        userEvents.addListener('user.signUp', function(data){
            sails.log("Hook:user_events_hook:on:user.signUp",data)

            var user = data.user;
            var req  = data.req;
            var sendActivationEmail = data.sendActivationEmail;
            if(sendActivationEmail) {
                userEvents.notify(user, req)
            }

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
