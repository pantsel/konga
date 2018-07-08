/**
 * SnapshotController
 *
 * @description :: Server-side logic for managing snapshots
 * @help        :: See http://sailsjs.org/#!/documentation/concepts/Controllers
 */

var _ = require("lodash");
var KongService = require('../services/KongService');

module.exports = _.merge(_.cloneDeep(require('../base/Controller')), {

  listTags: function (req, res) {
    sails.models.kongservices.find({
      where: {
        kong_node_id: req.connection.id
      },
      select: ['tags']
    }, function (err, extras) {
      if (err) return res.negotiate(err);
      var tags = [];
      extras.forEach(function (extra) {
        if (extra.tags instanceof Array)
          tags = tags.concat(extra.tags);
      });
      return res.json(_.uniq(tags));
    })
  },

  consumers: async (req,res) => {

    const serviceId = req.params.id;
    let serviceAclPlugin;


    KongService.fetch(`/services/${serviceId}/plugins?name=acl&enabled=true`, req, (err, response) => {
      if(err) return res.negotiate(err);

      if(!response.data || !response.data.length) return res.json([]);

      serviceAclPlugin = response.data[0];

      let whiteListedGroups = serviceAclPlugin.config.whitelist || [];
      let blackListedGroups = serviceAclPlugin.config.blacklist || [];

      console.log("whiteListedGroups",whiteListedGroups)
      console.log("blackListedGroups",blackListedGroups)

      // Fetch all acls
      KongService.fetch(`/acls`, req, (err, acls) => {
        if(err) return res.negotiate(err);
        if(!acls.data || !acls.data.length) return res.json([]);

        let filteredAcls = _.filter(acls.data, item => {
          return whiteListedGroups.indexOf(item.group) > -1 && blackListedGroups.indexOf(item.group) === -1;
        })


        console.log("filteredAcls", filteredAcls);

        let consumerIds = _.uniq(_.map(filteredAcls, item => item.consumer_id));

        console.log("consumerIds", consumerIds)

        // Fetch all consumers
        KongService.listAllCb(req, `/consumers`, (err, consumers) => {
          if (err) return res.negotiate(err);
          if(!consumers.data || !consumers.data.length) return res.json([]);

          let eligibleConsumers = _.filter(consumers.data, item => {
            return consumerIds.indexOf(item.id) > -1;
          })

          return res.json(eligibleConsumers)

        })
      })
    })
  }

});

