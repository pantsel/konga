'use strict';

var _ = require('lodash');

/**
 * KongNode.js
 *
 * @description :: TODO: You might write a short summary of how this model works and what it represents here.
 * @docs        :: http://sailsjs.org/#!documentation/models
 */
module.exports = _.merge(_.cloneDeep(require('../base/Model')), {
  attributes: {
    id : {
      type: 'string',
      primaryKey: true,
      required: true
    },
    username: {
      type: 'string'
    },
    custom_id: {
      type: 'string'
    },
    import_id: {
      type: 'string'
    },
    node_id : {
      type : 'string'
    }
  },
  autoPK: false,

  beforeCreate: function (values, cb) {
    if(!values.node_id) values.node_id = sails.config.kong_admin_url
    cb();
  }
});
