'use strict';

var actionUtil = require('sails/lib/hooks/blueprints/actionUtil');

/**
 * BaseController.js
 *
 * Base controller for all sails.js controllers. This just contains some common code
 * that every controller uses
 */
module.exports = {
  /**
   * Generic count action for controller.
   *
   * @param   {Request}   request
   * @param   {Response}  response
   */
  count: function count(request, response) {
    var Model = actionUtil.parseModel(request);

    Model
      .count(actionUtil.parseCriteria(request))
      .exec(function found(error, count) {
        if (error) {
          response.negotiate(error);
        } else {
          response.ok({count: count});
        }
      })
    ;
  }
};