'use strict';

var _ = require('lodash');
var HealthCheckEvents = require("../events/node-health-checks")

/**
 * KongNode.js
 *
 * @description :: TODO: You might write a short summary of how this model works and what it represents here.
 * @docs        :: http://sailsjs.org/#!documentation/models
 */
var defaultModel = _.merge(_.cloneDeep(require('../base/Model')), {
  tableName: "konga_kong_nodes",
  autoPK: false,
  attributes: {
    id: {
      type: 'integer',
      primaryKey: true,
      unique: true,
      autoIncrement: true
    },
    name: {
      type: 'string',
      required: true
    },

    type: {
      type: 'string',
      enum: ['default', 'key_auth', 'jwt'],
      defaultsTo: 'default'
    },

    kong_admin_url: {
      type: 'string',
      required: true
    },

    // netdata_connection: {
    //   model: 'netdataconnection'
    // },

    netdata_url : {
      type: 'string'
    },

    kong_api_key: {
      type: 'string',
      defaultsTo: ''
    },

    /**
     * JWT
     */
    jwt_algorithm: {
      type: 'string',
      enum: ['HS256', 'RS256'],
      defaultsTo: 'HS256'
    },

    jwt_key: {
      type: 'string'
    },

    jwt_secret: {
      type: 'string'
    },

    kong_version: {
      type: 'string',
      required: true,
      defaultsTo: '0-10-x'
    },
    health_checks: {
      type: 'boolean',
      defaultsTo: false
    },
    health_check_details: {
      type: 'json'
    },
    active: {
      type: 'boolean',
      required: true,
      defaultsTo: false
    }
  },

  afterDestroy: function (values, cb) {

    sails.log("KongNode:afterDestroy:called => ", values);

    // Stop health checks
    values.forEach(function (node) {
      HealthCheckEvents.emit('health_checks.stop', node);
    })

    cb();

  },

  afterUpdate: function (values, cb) {

    sails.log("KongNode:afterUpdate:called()")
    sails.log("KongNode:afterUpdate:health_checks", values.health_checks)

    // Manage toggle health checks
    if (values.health_checks) {
      // Send event to begin health checks for the updated node
      sails.log("KongNode:afterUpdate:emit health_checks.start")
      HealthCheckEvents.emit('health_checks.start', values);
    } else {
      // Send event to stop health checks for the updated node
      sails.log("KongNode:afterUpdate:emit health_checks.stop")
      HealthCheckEvents.emit('health_checks.stop', values);
    }

    cb()
  },
  // seedData: [
  //   {
  //     "name": "default",
  //     "kong_admin_url": "http://kong:8001",
  //     "active": true
  //   }
  // ]
});


var mongoModel = function () {
  var obj = _.cloneDeep(defaultModel)
  delete obj.autoPK
  delete obj.attributes.id
  return obj;
}

if(sails.config.models.connection == 'postgres' && process.env.DB_PG_SCHEMA) {
  defaultModel.meta =  {
    schemaName: process.env.DB_PG_SCHEMA
  }
}


module.exports = sails.config.models.connection == 'mongo' ? mongoModel() : defaultModel
