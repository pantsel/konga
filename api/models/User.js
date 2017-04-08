'use strict';

var _ = require('lodash');

/**
 * User.js
 *
 * @description :: TODO: You might write a short summary of how this model works and what it represents here.
 * @docs        :: http://sailsjs.org/#!documentation/models
 */


var defaultModel = _.merge(_.cloneDeep(require('../base/Model')), {
  tableName : "konga_users",
  autoPK: false,
  attributes: {
    id : {
      type: 'integer',
      primaryKey: true,
      unique: true,
      autoIncrement : true
    },
    username: {
      type: 'string',
      unique: true
    },
    email: {
      type: 'email',
      unique: true
    },
    firstName: {
      type: 'string',
      required: true
    },
    lastName: {
      type: 'string',
      required: true
    },
    admin: {
      type: 'boolean',
      defaultsTo: false
    },

    node_id : {
      type : 'string',
      defaultsTo: ''
    },

    node : {
      model : 'kongnode'
    },

    // Passport configurations
    passports: {
      collection: 'Passport',
      via: 'user'
    },
  },

  seedData:[
    {
      "username": "admin",
      "email": "admin@some.domain",
      "firstName": "Arnold",
      "lastName": "Administrator",
      "node_id" : "http://kong:8001",
      "admin": true
    },
    {
      "username": "demo",
      "email": "demo@some.domain",
      "firstName": "John",
      "lastName": "Doe",
      "node_id" : "http://kong:8001",
      "admin": false
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
