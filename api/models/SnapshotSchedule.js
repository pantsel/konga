'use strict';

var _ = require('lodash');

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
        }
    }
});


var mongoModel = function () {
    var obj = _.cloneDeep(defaultModel)
    delete obj.autoPK
    delete obj.attributes.id
    return obj;
}

module.exports = sails.config.models.connection == 'mongo' ? mongoModel() : defaultModel
