'use strict';

var _ = require('lodash');

/**
 * UserController
 *
 * @description :: Server-side logic for managing Users
 * @help        :: See http://links.sailsjs.org/docs/controllers
 */
module.exports = _.merge(_.cloneDeep(require('../base/Controller')), {

  find: function (req, res) {

    sails.models.settings.find().limit(1)
      .exec(function (err, settings) {

        if (err) return res.negotiate(err)

        var _settings = settings[0];
        if(!_settings) {
          sails.KONGA_CONFIG = {}
          return res.json({})
        }

        // Remove integrations from public json
        delete _settings.data.integrations;

        // Store settings in memory
        sails.KONGA_CONFIG = settings[0].data || {}
        return res.json(settings[0] ? settings[0] : {})
      })
  },

  getIntegrations : function (req,res) {
    sails.models.settings.find().limit(1)
      .exec(function (err, settings) {

        if (err) return res.negotiate(err)

        if(!settings[0]) {
          return res.json({})
        }

        return res.json(settings[0].data.integrations);
      })
  }
});
