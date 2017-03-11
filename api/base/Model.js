'use strict';

/**
 * api/base/model.js
 *
 * Base model for all sails.js models. This just contains some common code that every "nearly" every model uses.
 */
module.exports = {
  schema: true,

  attributes: {
    // Relation to User object via created user id
    createdUser: {
      model: 'User',
      columnName: 'createdUserId',
      defaultsTo: null
    },
    // Relation to User object via updated user id
    updatedUser: {
      model: 'User',
      columnName: 'updatedUserId',
      defaultsTo: null
    },

    // Dynamic model data attributes

    // Created timestamp as moment object
    createdAtObject: function() {
      return (this.createdAt && this.createdAt != '0000-00-00 00:00:00')
        ? sails.services['date'].convertDateObjectToUtc(this.createdAt) : null;
    },
    // Updated timestamp as moment object
    updatedAtObject: function() {
      return (this.updatedAt && this.updatedAt != '0000-00-00 00:00:00')
        ? sails.services['date'].convertDateObjectToUtc(this.updatedAt) : null;
    }
  }
};
