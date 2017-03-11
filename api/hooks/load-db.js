'use strict';

var _ = require('lodash');

/**
 * load-db.js
 *
 * This file contains a custom hook, that will be run after sails.js orm hook is loaded. Purpose of this hook is to
 * check that database contains necessary initial data for application.
 */
module.exports = function hook(sails) {
  return {
    /**
     * Private hook method to do actual database data population. Note that fixture data are only loaded if there
     * isn't any users in current database.
     *
     * @param {Function}  next  Callback function to call after all is done
     */
    process: function process(next) {
      sails.models.user
        .find()
        .exec(function callback(error, users) {
          if (error) {
            next(error);
          } else if (users.length !== 0 && JSON.stringify(users[0]) !== '{}') {
            next();
          } else {
            sails.log.verbose(__filename + ':' + __line + ' [Hook.load-db] Populating database with fixture data...');

            var _ = require('lodash');
            var Barrels = require('barrels');
            var barrels = new Barrels();
            var fixtures = _.keys(barrels.data);

            barrels.populate(['user'], function(error) {
              if (error) {
                next(error);
              }

              fixtures = _.without(fixtures, 'user');

              barrels.populate(fixtures, next, false);
            }, false);
          }
        })
      ;
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
