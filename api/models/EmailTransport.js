'use strict';

var _ = require('lodash');

/**
 * KongNode.js
 *
 * @description :: TODO: You might write a short summary of how this model works and what it represents here.
 * @docs        :: http://sailsjs.org/#!documentation/models
 */
var defaultModel = _.merge(_.cloneDeep(require('../base/Model')), {
    tableName: "konga_email_transports",
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
        description: {
            type: 'string'
        },
        schema: {
            type: 'json'
        },
        settings: {
            type: 'json'
        },
        active: {
            type: 'boolean',
            defaultsTo: false
        }
    },
    seedData: [
        {
            "name": "smtp",
            "description": "Send emails using the SMTP protocol",
            "schema": [
                {
                    name: "host",
                    description: "The SMTP host",
                    type: "text",
                    required: true
                },
                {
                    name: "port",
                    description: "The SMTP port",
                    type: "text",
                    required: true
                },
                {
                    name: "username",
                    model: "auth.user",
                    description: "The SMTP user username",
                    type: "text",
                    required: true
                },
                {
                    name: "password",
                    model: "auth.pass",
                    description: "The SMTP user password",
                    type: "text",
                    required: true
                },
                {
                    name: "secure",
                    model: "secure",
                    description: "Use secure connection",
                    type: "boolean"
                }
            ],
            "settings": {
                host: '',
                port: '',
                auth: {
                    user: '',
                    pass: ''
                },
                secure : false
            },
            "active": true
        },
        {
            "name": "sendmail",
            "description": "Pipe messages to the sendmail command",
            "settings": {
                sendmail: true
            }
        },
        {
            "name": "mailgun",
            "description": "Send emails through Mailgun’s Web API",
            "schema": [
                {
                    name: "api_key",
                    model: "auth.api_key",
                    description: "The API key that you got from www.mailgun.com/cp",
                    type: "text",
                    required: true
                },
                {
                    name: "domain",
                    model: "auth.domain",
                    description: "One of your domain names listed at your https://mailgun.com/app/domains",
                    type: "text",
                    required: true
                }

            ],
            "settings": {
                auth: {
                    api_key: '',
                    domain: ''
                }
            }
        }
    ]
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
