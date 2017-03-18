'use strict';

var _ = require('lodash');

/**
 * KongNode.js
 *
 * @description :: TODO: You might write a short summary of how this model works and what it represents here.
 * @docs        :: http://sailsjs.org/#!documentation/models
 */
var defaultModel = _.merge(_.cloneDeep(require('../base/Model')), {
  tableName : "konga_kong_nodes",
  autoPK : false,
  attributes: {
    id : {
      type: 'integer',
      primaryKey: true,
      unique: true,
      autoIncrement : true
    },
    name: {
      type: 'string',
      required : true
    },
    kong_admin_url: {
      type: 'string',
      required : true
    },
    kong_version: {
      type: 'string',
      required : true,
      defaultsTo : '0-10-x'
    },
    active: {
      type: 'boolean',
      required : true,
      defaultsTo : false
    }
  },
  seedData : [
    {
      "name" : "default",
      "kong_admin_url": "http://localhost:8001",
      "active": false
    }
  ]
});


var mongoModel = function() {
  var obj = _.cloneDeep(defaultModel)
  delete obj.autoPK
  delete obj.attributes.id
  return obj;
}

module.exports = sails.config.models.connection == 'mongo' ? mongoModel() : defaultModel
