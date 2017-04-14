'use strict';

var _ = require('lodash');

/**
 * KongNode.js
 *
 * @description :: TODO: You might write a short summary of how this model works and what it represents here.
 * @docs        :: http://sailsjs.org/#!documentation/models
 */
var defaultModel = _.merge(_.cloneDeep(require('../base/Model')), {
  tableName : "konga_email_transports",
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
      required : true,
      unique: true
    },
    description : {
      type: 'string'
    },
    schema : {
      type : 'json'
    },
    settings : {
      type : 'json'
    },
    active : {
      type : 'boolean',
      defaultsTo : false
    }
  },
  seedData : [
    {
      "name" : "smtp",
      "description" : "Send emails using the SMTP protocol",
      "schema": [
        {
          name : "host",
          description : "The SMTP host",
          type : "text",
          required : true
        },
        {
          name : "port",
          description : "The SMTP port",
          type : "text",
          required : true
        },
        {
          name : "username",
          model : "auth.user",
          description : "The SMTP user username",
          type : "text",
          required : true
        },
        {
          name : "password",
          model : "auth.pass",
          description : "The SMTP user password",
          type : "text",
          required : true
        }
      ],
      "settings" : {
        host : '',
        port : '',
        auth: {
          user: '',
          pass: ''
        }
      },
      "active" : true
    },
    {
      "name" : "sendmail",
      "description" : "Pipe messages to the sendmail command",
      "schema": [
        {
          name : "newline",
          defaultValue : "unix",
          description : "Either 'windows' or 'unix' (default). Forces all newlines in the output to either use Windows syntax <CR><LF> or Unix syntax <LF>",
          type : "select",
          options : ["windows","unix"]
        },
        {
          name : "path",
          defaultValue : "/usr/sbin/sendmail",
          description : "Path to the sendmail command",
          type : "text",
          required : true
        },
        {
          name : "args",
          description : 'An optional array of command line options to pass to the sendmail command (ie. ["-f", "foo@blurdybloop.com"]). This overrides all default arguments except for ’-i’ and recipient list so you need to make sure you have all required arguments set (ie. the ‘-f’ flag)',
          type : "array"
        }

      ],
      "settings" : {
        sendmail: true,
        newline : 'unix',
        path: '/usr/sbin/sendmail'
      }
    },
    {
      "name" : "mailgun",
      "description" : "Send emails through Mailgun’s Web API",
      "schema": [
        {
          name : "api_key",
          model : "auth.api_key",
          description : "The API key that you got from www.mailgun.com/cp",
          type : "text",
          required : true
        },
        {
          name : "domain",
          model : "auth.domain",
          description : "One of your domain names listed at your https://mailgun.com/app/domains",
          type : "text",
          required : true
        }

      ],
      "settings" : {
        auth: {
          api_key: '',
          domain: ''
        }
      }
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
