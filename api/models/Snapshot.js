'use strict';

var _ = require('lodash');

/**
 * KongNode.js
 *
 * @description :: TODO: You might write a short summary of how this model works and what it represents here.
 * @docs        :: http://sailsjs.org/#!documentation/models
 */
var defaultModel = _.merge(_.cloneDeep(require('../base/Model')), {
    tableName: "konga_kong_snapshots",
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
            required: true,
            unique: true
        },
        kong_node_name: {
            type: 'string'
        },
        kong_node_url: {
            type: 'string'
        },
        kong_version: {
            type: 'string'
        },
        data: {
            type: 'json',
            required: true
        }
    },
    afterCreate: function (values, cb) {
        sails.log("Snapshot created!!!!!!!!!!!!!!!!!!!!!!!!!")
        sails.sockets.blast('events.snapshots', {
            verb : 'created',
            data : values
        });
        cb()
    }
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
