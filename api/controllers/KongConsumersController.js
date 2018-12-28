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

      // Fetch all services
      let data = await Kong.fetch(`/services`, req);

      let services = data.data;

      let servicePluginsFns = [];

      // Prepare service objects
      services.forEach(function(service){
        // Add consumer id
        service.consumer_id = consumerId;

        servicePluginsFns.push(function(cb){
          return Kong.listAllCb(req,'/services/' + service.id + '/plugins?enabled=true',cb);
        });
      });


      // Foreach service, fetch it's assigned plugins
      async.series(servicePluginsFns,function (err,data) {
        if(err) return res.negotiate(err);

        data.forEach(function(plugins,index){

          // Separate acl plugins in an acl property
          let acl = _.find(plugins.data,function(item){
            return item.name === "acl" && item.enabled === true;
          });

          if(acl) {
            services[index].acl = acl;
          }

          // Add plugins to their respective service
          services[index].plugins = plugins;

          let authenticationPlugins = _.filter(plugins.data, item => ['jwt','basic-auth','key-auth','hmac-auth','oauth2'].indexOf(item.name) > -1);
          authenticationPlugins = _.map(authenticationPlugins, item => item.name);
          sails.log("authenticationPlugins",authenticationPlugins);
          services[index].auths = authenticationPlugins;
        });


        // Gather apis with no access control restrictions whatsoever
        let open =  _.filter(services,function (service) {
          return !service.acl && !service.auths.length;
        })

        // Gather services with auths matching at least on consumer credential
        let matchingAuths = _.filter(services,function (service) {
          return _.intersection(service.auths, consumerAuths).length > 0;
        });


        // Gather apis with access control restrictions whitelisting at least one of the consumer's groups.
        let whitelisted = _.filter(services,function (service) {
          return service.acl && _.intersection(service.acl.config.whitelist,consumerGroups).length > 0;
        });

        let eligible = matchingAuths.length && whitelisted.length ? _.intersection(matchingAuths, whitelisted) : matchingAuths.concat(whitelisted);

        return res.json({
          total : open.length + eligible.length,
          data  : open.concat(eligible)
        });
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


      // Foreach service, fetch it's assigned plugins
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
          data  : open.concat(eligible)
        });
      });
    }catch(e) {
      return res.negotiate(e);
    }
  }

};

module.exports = KongConsumersController;
