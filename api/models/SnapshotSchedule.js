'use strict';

var _ = require('lodash');
var Scheduler = require("../services/SnapshotsScheduler");

var defaultModel = _.merge(_.cloneDeep(require('../base/Model')), {
    tableName: "konga_kong_snapshot_schedules",
    autoPK: false,
    attributes: {
        id: {
            type: 'integer',
            primaryKey: true,
            unique: true,
            autoIncrement: true
        },
        // name: {
        //     type: 'string',
        //     required: true,
        //     unique: true
        // },
        connection: {
            model: 'kongnode'
        },
        active : {
            type : 'boolean',
            defaultsTo : true
        },
        cron : {
            type : 'string',
            required : true
        },

        lastRunAt : {
            type : 'date',
            defaultsTo : null
        }
    },

    beforeUpdate: function (values, cb) {
        sails.log("SnapshotSchedule:beforeUpdate", values);


        cb();
    },

    afterUpdate: function (values, cb) {
        sails.log("SnapshotSchedule:afterUpdate", values);


        if(!values.active) {
            // Stop cron job
            Scheduler.remove(values);

        }else{
            // Start cron job
            Scheduler.add(values);
        }


        cb();
    },


    afterCreate: function (values, cb) {
        sails.log("SnapshotSchedule:afterCreate", values);


        if(values.active) {
            // Start cron job
            Scheduler.add(values);
        }

        cb();
    },

    afterDestroy: function (items, cb) {
        sails.log("SnapshotSchedule:afterDestroy", items);

        items.forEach(function (item) {
            Scheduler.remove(item);
        })

        cb();
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
