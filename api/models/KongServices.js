'use strict';

var _ = require('lodash');

/**
 * ApiHealthCheck.js
 *
 * @description :: TODO: You might write a short summary of how this model works and what it represents here.
 * @docs        :: http://sailsjs.org/#!documentation/models
 */
var defaultModel = _.merge(_.cloneDeep(require('../base/Model')), {
  tableName : "konga_kong_services",
  autoPK : false,
  attributes: {
    id : {
      type: 'integer',
      primaryKey: true,
      unique: true,
      autoIncrement : true
    },

    service_id : {
      type : "string",
      required : true,
      unique: true
    },

    kong_node_id: {
      type: "string",
      required: true
    },

    description : {
      type : 'string'
    },

    tags : {
      type : "json"
    }
  }
});

var mongoModel =  _.omit(_.cloneDeep(defaultModel),["autoPK","attributes.id"]);

if(sails.config.models.connection == 'postgres' && process.env.DB_PG_SCHEMA) {
  defaultModel.meta =  {
    schemaName: process.env.DB_PG_SCHEMA
  }
}


module.exports = sails.config.models.connection == 'mongo' ? mongoModel : defaultModel
