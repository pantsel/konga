/**
 * ApiHealthCheckController
 *
 * @description :: Server-side logic for managing apihealthchecks
 * @help        :: See http://sailsjs.org/#!/documentation/concepts/Controllers
 */


var _ = require('lodash');

module.exports = _.merge(_.cloneDeep(require('../base/Controller')), {

    subscribeHealthChecks: function(req, res) {

        if (!req.isSocket) {
            sails.log.error("ApiHealthCheckController:subscribe failed")
            return res.badRequest('Only a client socket can subscribe.');
        }

        var roomName = 'api.health_checks';
        sails.sockets.join(req.socket, roomName);
        res.json({
            room: roomName
        });
    },

  reset : function (req, res) {
    sails.models.apihealthcheck.destroy({}, function (err, done) {
      if(err) return res.negotiate(err);
      return res.json(done);
    })
  }

});

