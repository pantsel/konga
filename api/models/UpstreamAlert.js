'use strict';

var _ = require('lodash');
var HealthCheckEvents = require("../events/upstream-health-checks");

/**
 * ApiHealthCheck.js
 *
 * @description :: TODO: You might write a short summary of how this model works and what it represents here.
 * @docs        :: http://sailsjs.org/#!documentation/models
 */
var defaultModel = _.merge(_.cloneDeep(require('../base/Model')), {
  tableName : "konga_kong_upstream_alerts",
  autoPK : false,
  attributes: {
    id : {
      type: 'integer',
      primaryKey: true,
      unique: true,
      autoIncrement : true
    },

    upstream_id : {
      type : "string",
      required : true,
      unique: true
    },

    connection: {
      model: 'kongnode',
      required: true
    },

    email: {
      type: 'boolean',
      defaultsTo: false
    },

    slack: {
      type: 'boolean',
      defaultsTo: false
    },

    cron : {
      type : 'string'
    },

    active: {
      type: 'boolean',
      defaultsTo: false
    },

    data : {
      type : 'json'
    }
  },


  afterUpdate: function (values, cb) {

    sails.log("UpstreamAlert:afterUpdate:called()", values)

    // Manage toggle health checks
    if(values.active) {
      // Send event to begin health checks for the updated node
      sails.log("UpstreamAlert:afterUpdate:emit upstream.health_checks.start")
      HealthCheckEvents.emit('upstream.health_checks.start',values);
    }else{
      // Send event to stop health checks for the updated node
      sails.log("UpstreamAlert:afterUpdate:emit upstream.health_checks.stop")
      HealthCheckEvents.emit('upstream.health_checks.stop',values);
    }


    cb()
  },
});


var mongoModel = function() {
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
