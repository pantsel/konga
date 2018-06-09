/**
 * SnapshotController
 *
 * @description :: Server-side logic for managing snapshots
 * @help        :: See http://sailsjs.org/#!/documentation/concepts/Controllers
 */

var _ = require("lodash");

module.exports = _.merge(_.cloneDeep(require('../base/Controller')), {

    listTags: function (req, res) {
      sails.models.kongservices.find({
        where: {
          kong_node_id: req.connection.id
        },
        select: ['tags']
      }, function (err, extras) {
        if(err) return res.negotiate(err);
        var tags = [];
        extras.forEach(function (extra) {
          if(extra.tags instanceof Array)
          tags = tags.concat(extra.tags);
        });
        return res.json(_.uniq(tags));
      })
    }

});

