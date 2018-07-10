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
    // let serviceJWT;
    // let serviceBasicAuth;
    // let serviceKeyAuth;
    // let serviceOauth2;
    // let serviceHMACAuth;


    sails.log("KongServiceController:consumers called");

    let plugins = await KongService.fetch(`/services/${serviceId}/plugins?enabled=true`, req);

    if(plugins.total == 0) return res.json([]);

    sails.log("Service plugins =>", plugins);

    serviceAclPlugin = _.filter(plugins.data, item => item.name === 'acl')[0];
    // serviceJWT = _.filter(plugins.data, item => item.name == 'jwt')[0];
    // serviceBasicAuth = _.filter(plugins.data, item => item.name == 'basic-auth')[0];
    // serviceKeyAuth = _.filter(plugins.data, item => item.name == 'key-auth')[0];
    // serviceOauth2 = _.filter(plugins.data, item => item.name == 'oauth2')[0];
    // serviceHMACAuth = _.filter(plugins.data, item => item.name == 'hmac-auth')[0];

    sails.log("serviceAclPlugin",serviceAclPlugin)

    let aclConsumerIds;

    if(serviceAclPlugin) {
      // This service is Access Controlled by ACL plugin

      let whiteListedGroups = serviceAclPlugin.config.whitelist || [];
      let blackListedGroups = serviceAclPlugin.config.blacklist || [];

      // ACL
      sails.log("whiteListedGroups",whiteListedGroups)
      sails.log("blackListedGroups",blackListedGroups)

      // We need to retrieve all acls and filter the accessible ones based on the whitelisted and blacklisted groups
      let acls = await KongService.fetch(`/acls`, req);

      let filteredAcls = _.filter(acls.data, item => {
        return whiteListedGroups.indexOf(item.group) > -1 && blackListedGroups.indexOf(item.group) === -1;
      });
      sails.log("filteredAcls", filteredAcls);

      // Gather the consume ids of the filtered groups
      aclConsumerIds = _.map(filteredAcls, item => item.consumer_id);
    }


    let jwts = await KongService.fetch(`/jwts`, req);
    let keyAuths = await KongService.fetch(`/key-auths`, req);
    let hmacAuths = await KongService.fetch(`/hmac-auths`, req);
    let oauth2 = await KongService.fetch(`/oauth2`, req);
    let basicAuths = await KongService.fetch(`/basic-auths`, req);


    let jwtConsumerIds = _.map(jwts.data, item => item.consumer_id);
    let keyAuthConsumerIds = _.map(keyAuths.data, item => item.consumer_id);
    let hmacAuthConsumerIds = _.map(hmacAuths.data, item => item.consumer_id);
    let oauth2ConsumerIds = _.map(oauth2.data, item => item.consumer_id);
    let basicAuthConsumerIds = _.map(basicAuths.data, item => item.consumer_id);

    sails.log("jwtConsumerIds",jwtConsumerIds)
    sails.log("keyAuthConsumerIds",keyAuthConsumerIds)
    sails.log("hmacAuthConsumerIds",hmacAuthConsumerIds)
    sails.log("oauth2ConsumerIds",oauth2ConsumerIds)
    sails.log("basicAuthConsumerIds",basicAuthConsumerIds)

    let consumerIds;
    let authenticationPluginsConsumerIds = _.uniq([
      ...jwtConsumerIds,
      ...keyAuthConsumerIds,
      ...hmacAuthConsumerIds,
      ...oauth2ConsumerIds,
      ...basicAuthConsumerIds
    ]);

    if(aclConsumerIds) {


      sails.log("authenticationPluginsConsumerIds", authenticationPluginsConsumerIds);
      sails.log("aclConsumerIds", _.uniq(aclConsumerIds));
      consumerIds = _.intersection(_.uniq(aclConsumerIds), authenticationPluginsConsumerIds);

    }else{
      consumerIds = authenticationPluginsConsumerIds;
    }


    sails.log("consumerIds => ", consumerIds);

    // Fetch all consumers
    KongService.listAllCb(req, `/consumers`, (err, consumers) => {
      if (err) return res.negotiate(err);
      if(!consumers.data || !consumers.data.length) return res.json([]);

      let eligibleConsumers = _.filter(consumers.data, item => {
        return consumerIds.indexOf(item.id) > -1;
      })

      return res.json({
        total: eligibleConsumers.length,
        data: eligibleConsumers
      })

    })
  }

});

