const _ = require('lodash');
const Kong = require("../services/KongService");
const async = require("async");



var KongConsumersController = {

  apis: (req, res) => {

    var consumerId = req.param("id");

    // Fetch all acls of the specified consumer
    Kong.listAllCb(req, '/consumers/' + consumerId + '/acls', function (err, _acls) {
      if (err) return res.negotiate(err);

      // Make an array of group names
      var consumerGroups = _.map(_acls.data, function (item) {
        return item.group;
      });

      // Fetch all apis
      Kong.listAllCb(req, '/apis', function (err, data) {
        if (err) return res.negotiate(err);

        var apis = data.data;

        var apiPluginsFns = [];

        // Prepare api objects
        apis.forEach(function (api) {
          // Add consumer id
          api.consumer_id = consumerId;

          apiPluginsFns.push(function (cb) {
            return Kong.listAllCb(req, '/apis/' + api.id + '/plugins', cb);
          });
        });


        // Foreach api, fetch it's assigned plugins
        async.series(apiPluginsFns, function (err, data) {
          if (err) return res.negotiate(err);

          data.forEach(function (plugins, index) {

            // Separate acl plugins in an acl property
            var acl = _.find(plugins.data, function (item) {
              return item.name === "acl" && item.enabled === true;
            });

            if (acl) {
              apis[index].acl = acl;
            }

            // Add plugins to their respective api
            apis[index].plugins = plugins;
          });


          // Gather apis with no access control restrictions whatsoever
          var open = _.filter(apis, function (api) {
            return !api.acl;
          })


          // Gather apis with access control restrictions whitelisting at least one of the consumer's groups.
          var whitelisted = _.filter(apis, function (api) {
            return api.acl && _.intersection(api.acl.config.whitelist, consumerGroups).length > 0;
          });


          return res.json({
            total: open.length + whitelisted.length,
            data: open.concat(whitelisted)
          });
        });
      });
    });

  },

  services : async (req,res) => {

    var consumerId = req.param("id");

    try {

      const nodeInfo = await Kong.info(req.connection);

      let jwts = [];
      let keyAuths = [];
      let hmacAuths = [];
      let oauth2 = [];
      let basicAuths = [];

      // ToDo: clean this up somehow
      if(_.get(nodeInfo, 'plugins.available_on_server.jwt')) {
        let jwtsRecs = await Kong.fetch(`/jwts`, req);
        jwts = _.filter(jwtsRecs.data, item => _.get(item, 'consumer.id') === consumerId);
      }

      if(_.get(nodeInfo, 'plugins.available_on_server.key-auth')) {
        let keyAuthsRecs = await Kong.fetch(`/key-auths`, req);
        keyAuths = _.filter(keyAuthsRecs.data, item => _.get(item, 'consumer.id') === consumerId);
      }

      if(_.get(nodeInfo, 'plugins.available_on_server.hmac-auth')) {
        let hmacAuthsRecs = await Kong.fetch(`/hmac-auths`, req);
        hmacAuths = _.filter(hmacAuthsRecs.data, item => _.get(item, 'consumer.id') === consumerId);
      }

      if(_.get(nodeInfo, 'plugins.available_on_server.oauth2')) {
        let oauth2Recs = await Kong.fetch(`/oauth2`, req);
        oauth2 = _.filter(oauth2Recs.data, item => _.get(item, 'consumer.id') === consumerId);
      }

      if(_.get(nodeInfo, 'plugins.available_on_server.basic-auth')) {
        let basicAuthsRecs = await Kong.fetch(`/basic-auths`, req);
        basicAuths = _.filter(basicAuthsRecs.data, item => _.get(item, 'consumer.id') === consumerId);
      }


      // Gather the credentials that belong to the consumer
      let consumerAuths = [];
      if(jwts.length) consumerAuths.push('jwt');
      if(keyAuths.length) consumerAuths.push('key-auth');
      if(hmacAuths.length) consumerAuths.push('hmac-auth');
      if(oauth2.length) consumerAuths.push('oauth2');
      if(basicAuths.length) consumerAuths.push('basic-auth');

      sails.log("KongConsumersController:services:consumerAuths", consumerAuths)

      // Fetch all groups the consumer belongs to
      let _acls = await Kong.fetch(`/consumers/${consumerId}/acls`, req);

      // Keep only group names
      let consumerGroups = _.map(_acls.data,function(item){
        return item.group;
      });
      sails.log("KongConsumersController:services:consumerGroups", consumerGroups)


      // Fetch all services
      const servicesRecords = await Kong.fetch(`/services`, req);
      let services = servicesRecords.data;

      // Fetch all plugins
      const allPluginsRecords = await Kong.fetch(`/plugins`, req);
      let allPlugins = _.filter(allPluginsRecords.data, item => item.enabled); // Filter out the disabled ones


      // Assign plugins to their respective service
      services.forEach(service => {
        // Assign the consumer_id to the service.
        // We need this @ the frontend
        service.consumer_id = consumerId;

        // Assign plugins to the service
        service.plugins = _.filter(allPlugins, plugin => service.id === _.get(plugin, 'service.id'));

        // Separate acl plugins in an acl property
        // We will need this to better handle things @ the frontend
        let acl = _.find(service.plugins,item => item.name === 'acl');
        if(acl) service.acl = acl;

        let authenticationPlugins = _.filter(service.plugins, item => ['jwt','basic-auth','key-auth','hmac-auth','oauth2'].indexOf(item.name) > -1);
        authenticationPlugins = _.map(authenticationPlugins, item => item.name);
        sails.log("authenticationPlugins",authenticationPlugins);
        service.auths = authenticationPlugins;
      });


      // Gather services with no access control restrictions whatsoever
      let open =  _.filter(services,function (service) {
        return !service.acl && !service.auths.length;
      })
      sails.log("***********************************************")
      sails.log("KongConsumersController:services:open", _.map(open, item => item.name))
      sails.log("***********************************************")

      // Gather services with auths matching at least one consumer credential
      let matchingAuths = _.filter(services,function (service) {
        return _.intersection(service.auths, consumerAuths).length > 0;
      });
      sails.log("***********************************************")
      sails.log("KongConsumersController:services:matchingAuths", _.map(matchingAuths, item => item.name))
      sails.log("***********************************************")

      // Gather services with access control restrictions whitelisting at least one of the consumer's groups.
      let whitelisted = _.filter(services,function (service) {
        return service.acl && _.intersection(service.acl.config.whitelist,consumerGroups).length > 0;
      });
      sails.log("***********************************************")
      sails.log("KongConsumersController:services:whitelisted", _.map(whitelisted, item => item.name))
      sails.log("***********************************************")


      // Gather services with no authentication plugins
      // & access control restrictions whitelisting at least one of the consumer's groups.
      let whitelistedNoAuth = _.filter(services,function (service) {
        return service.acl
          && _.intersection(service.acl.config.whitelist,consumerGroups).length > 0
          && (!service.auths || !service.auths.length);
      });
      sails.log("***********************************************")
      sails.log("KongConsumersController:services:whitelistedNoAuth", _.map(whitelistedNoAuth, item => item.name))
      sails.log("***********************************************")


      // Get the services the consumer can access based on ACL and authentication plugins
      let eligible = matchingAuths.length && whitelisted.length ? _.intersection(matchingAuths, whitelisted) : matchingAuths.concat(whitelisted);
      eligible = _.union(eligible.concat(whitelistedNoAuth)); // At the end, add the whitelistedNoAuth services that escape the above `intersection`
      sails.log("***********************************************")
      sails.log("KongConsumersController:services:eligible", _.map(eligible, item => item.name))
      sails.log("***********************************************")


      let servicesResults = open.concat(eligible);
      const routes  = await Kong.fetchConsumerRoutes(req, consumerId, consumerAuths, consumerGroups, allPlugins);

      servicesResults.forEach(service => {
        let _routes = _.filter(routes.data, route => {
          return route.service.id === service.id;
        });

        if(_routes) {
          service.routes = _routes;
        }
      });

      // Filter out the services that have no eligible routes
      const filtered = _.filter(servicesResults, service => service.routes && service.routes.length);

      return res.json({
        total : filtered.length,
        data  : filtered
      });
    }catch (e) {
      return res.negotiate(e);
    }

  },

  routes : async (req,res) => {
    let consumerId = req.param("id");

    try {

      const nodeInfo = await Kong.info(req.connection);

      let jwts = [];
      let keyAuths = [];
      let hmacAuths = [];
      let oauth2 = [];
      let basicAuths = [];

      // ToDo: clean this up somehow
      if(_.get(nodeInfo, 'plugins.available_on_server.jwt')) {
        let jwtsRecs = await Kong.fetch(`/jwts`, req);
        jwts = _.filter(jwtsRecs.data, item => _.get(item, 'consumer.id') === consumerId);
      }

      if(_.get(nodeInfo, 'plugins.available_on_server.key-auth')) {
        let keyAuthsRecs = await Kong.fetch(`/key-auths`, req);
        keyAuths = _.filter(keyAuthsRecs.data, item => _.get(item, 'consumer.id') === consumerId);
      }

      if(_.get(nodeInfo, 'plugins.available_on_server.hmac-auth')) {
        let hmacAuthsRecs = await Kong.fetch(`/hmac-auths`, req);
        hmacAuths = _.filter(hmacAuthsRecs.data, item => _.get(item, 'consumer.id') === consumerId);
      }

      if(_.get(nodeInfo, 'plugins.available_on_server.oauth2')) {
        let oauth2Recs = await Kong.fetch(`/oauth2`, req);
        oauth2 = _.filter(oauth2Recs.data, item => _.get(item, 'consumer.id') === consumerId);
      }

      if(_.get(nodeInfo, 'plugins.available_on_server.basic-auth')) {
        let basicAuthsRecs = await Kong.fetch(`/basic-auths`, req);
        basicAuths = _.filter(basicAuthsRecs.data, item => _.get(item, 'consumer.id') === consumerId);
      }


      let consumerAuths = []
      if(jwts.length) consumerAuths.push('jwt');
      if(keyAuths.length) consumerAuths.push('key-auth');
      if(hmacAuths.length) consumerAuths.push('hmac-auth');
      if(oauth2.length) consumerAuths.push('oauth2');
      if(basicAuths.length) consumerAuths.push('basic-auth');

      sails.log("consumerAuths", consumerAuths)

      // Fetch all acls of the specified consumer
      let _acls = await Kong.fetch(`/consumers/${consumerId}/acls`, req);


      // Make an array of group names
      let consumerGroups = _.map(_acls.data,function(item){
        return item.group;
      });

      // Fetch all routes
      let data = await Kong.fetch(`/routes`, req)

      let routes = data.data;

      let routePluginsFns = [];

      // Prepare service objects
      routes.forEach(function(route){
        // Add consumer id
        route.consumer_id = consumerId;

        routePluginsFns.push(function(cb){
          return Kong.listAllCb(req,'/routes/' + route.id + '/plugins',cb);
        });
      });


      // Foreach route, fetch it's assigned plugins
      async.series(routePluginsFns,function (err,data) {
        if(err) return res.negotiate(err);

        data.forEach(function(plugins,index){

          // Separate acl plugins in an acl property
          var acl = _.find(plugins.data,function(item){
            return item.name === "acl" && item.enabled === true;
          });

          if(acl) {
            routes[index].acl = acl;
          }

          // Add plugins to their respective service
          routes[index].plugins = plugins;

          let authenticationPlugins = _.filter(plugins.data, item => ['jwt','basic-auth','key-auth','hmac-auth','oauth2'].indexOf(item.name) > -1);
          authenticationPlugins = _.map(authenticationPlugins, item => item.name);
          sails.log("authenticationPlugins",authenticationPlugins);
          routes[index].auths = authenticationPlugins;
        });


        // Gather apis with no access control restrictions whatsoever
        let open =  _.filter(routes,function (route) {
          return !route.acl && !route.auths.length;
        })

        // Gather services with auths matching at least on consumer credential
        let matchingAuths = _.filter(routes,function (route) {
          return _.intersection(route.auths, consumerAuths).length > 0;
        });


        // Gather apis with access control restrictions whitelisting at least one of the consumer's groups.
        let whitelisted = _.filter(routes,function (route) {
          return route.acl && _.intersection(route.acl.config.whitelist,consumerGroups).length > 0;
        });

        let eligible = matchingAuths.length && whitelisted.length ? _.intersection(matchingAuths, whitelisted) : matchingAuths.concat(whitelisted);

        return res.json({
          total : open.length + eligible.length,
          data  : _.uniqBy(open.concat(eligible), 'id')
        });
      });
    }catch(e) {
      return res.negotiate(e);
    }
  }

};

module.exports = KongConsumersController;
