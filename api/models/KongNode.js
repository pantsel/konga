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
    name: {
      type: 'string',
      required : true
    },
    kong_admin_url: {
      type: 'string',
      required : true
    },
    active: {
      type: 'boolean',
      required : true,
      defaultsTo : false
    }
  }
});
