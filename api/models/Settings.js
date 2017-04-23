'use strict';

var _ = require('lodash');

/**
 * KongNode.js
 *
 * @description :: TODO: You might write a short summary of how this model works and what it represents here.
 * @docs        :: http://sailsjs.org/#!documentation/models
 */
var defaultModel = _.merge(_.cloneDeep(require('../base/Model')), {
  tableName : "konga_settings",
  autoPK : false,
  attributes: {
    id : {
      type: 'integer',
      primaryKey: true,
      unique: true,
      autoIncrement : true
    },
    data: {
      type: 'json'
    },
  },
  seedData : [
    {
      "data" : {
        email_notifications : false,
        default_transport : 'sendmail',
      }
    },
  ]
});


var mongoModel = function() {
  var obj = _.cloneDeep(defaultModel)
  delete obj.autoPK
  delete obj.attributes.id
  return obj;
}

module.exports = sails.config.models.connection == 'mongo' ? mongoModel() : defaultModel
