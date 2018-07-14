'use strict';

var _ = require('lodash');
var HealthCheckEvents = require("../events/api-health-checks")

/**
 * ApiHealthCheck.js
 *
 * @description :: TODO: You might write a short summary of how this model works and what it represents here.
 * @docs        :: http://sailsjs.org/#!documentation/models
 */
var defaultModel = _.merge(_.cloneDeep(require('../base/Model')), {
  tableName : "konga_api_health_checks",
  autoPK : false,
  attributes: {
    id : {
      type: 'integer',
      primaryKey: true,
      unique: true,
      autoIncrement : true
    },

    api_id : {
      type : "string",
      required : true,
      unique: true
    },

    api : {
      type : 'json'
    },

    health_check_endpoint : {
      type : "string"
    },

    notification_endpoint : {
      type : "string",
    },

    active : {
      type : 'boolean',
      defaultsTo : false
    },

    data : {
      type : 'json'
    }
  },


  afterUpdate: function (values, cb) {

    sails.log("ApiHealthCheck:afterUpdate:called()")
    sails.log("ApiHealthCheck:afterUpdate:health_checks",values)

    // Manage toggle health checks
    if(values.active) {
      // Send event to begin health checks for the updated node
      sails.log("ApiHealthCheck:afterUpdate:emit api.health_checks.start")
      HealthCheckEvents.emit('api.health_checks.start',values);
    }else{
      // Send event to stop health checks for the updated node
      sails.log("ApiHealthCheck:afterUpdate:emit api.health_checks.stop")
      HealthCheckEvents.emit('api.health_checks.stop',values);
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
