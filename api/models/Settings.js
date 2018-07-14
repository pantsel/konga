'use strict';

var _ = require('lodash');

/**
 * KongNode.js
 *
 * @description :: TODO: You might write a short summary of how this model works and what it represents here.
 * @docs        :: http://sailsjs.org/#!documentation/models
 */
var defaultModel = _.merge(_.cloneDeep(require('../base/Model')), {
  tableName: "konga_settings",
  autoPK: false,
  attributes: {
    id: {
      type: 'integer',
      primaryKey: true,
      unique: true,
      autoIncrement: true
    },
    data: {
      type: 'json'
    },
  },
  seedData: [
    {
      "data": {
        // Default signup enabled to false on new databases
        //  if admins want signup enabled they can switch it on
        //  via settings. This seems to be more secure.
        signup_enable: false,
        signup_require_activation: false,
        info_polling_interval: 5000,
        email_default_sender_name: 'KONGA',
        email_default_sender: 'konga@konga.test',
        email_notifications: false,
        default_transport: 'sendmail',
        notify_when: {
          node_down: {
            title: "A node is down or unresponsive",
            description: "Health checks must be enabled for the nodes that need to be monitored.",
            active: false
          },
          api_down: {
            title: "An API is down or unresponsive",
            description: "Health checks must be enabled for the APIs that need to be monitored.",
            active: false
          }
        },

        integrations: [
          {
            id: "slack",
            name: "Slack",
            image: "slack_rgb.png",
            config: {
              enabled: false,
              fields: [{
                id: "slack_webhook_url",
                name: "Slack Webhook URL",
                type: "text",
                required: true,
                value: ""
              }],
              slack_webhook_url: ""
            }
          }
        ],

        user_permissions: {
          apis: {
            create: false,
            read: true,
            update: false,
            delete: false
          },
          services: {
            create: false,
            read: true,
            update: false,
            delete: false
          },
          routes: {
            create: false,
            read: true,
            update: false,
            delete: false
          },
          consumers: {
            create: false,
            read: true,
            update: false,
            delete: false
          },
          plugins: {
            create: false,
            read: true,
            update: false,
            delete: false
          },
          upstreams: {
            create: false,
            read: true,
            update: false,
            delete: false
          },
          certificates: {
            create: false,
            read: true,
            update: false,
            delete: false
          },
          connections: {
            create: false,
            read: true,
            update: false,
            delete: false
          },
          users: {
            create: false,
            read: true,
            update: false,
            delete: false
          }
        }
      }
    },
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
