'use strict';

/**
 * Route Mappings
 * (sails.config.routes)
 *
 * Your routes map URLs to views and controllers.
 *
 * If Sails receives a URL that doesn't match any of the routes below,
 * it will check for matching files (images, scripts, stylesheets, etc.)
 * in your assets directory.  e.g. `http://localhost:1337/images/foo.jpg`
 * might match an image file: `/assets/images/foo.jpg`
 *
 * Finally, if those don't match either, the default 404 handler is triggered.
 * See `config/404.js` to adjust your app's 404 logic.
 *
 * Note: Sails doesn't ACTUALLY serve stuff from `assets`-- the default Gruntfile in Sails copies
 * flat files from `assets` to `.tmp/public`.  This allows you to do things like compile LESS or
 * CoffeeScript for the front-end.
 *
 * For more information on configuring custom routes, check out:
 * http://sailsjs.org/#/documentation/concepts/Routes/RouteTargetSyntax.html
 */

module.exports.routes = {
  // See https://github.com/balderdashy/sails/issues/2062
  'OPTIONS /*': function (req, res) {
    res.send(200);
  },

  '/': async (req, res) => {

    const usersCount = await sails.models.user.count();

    if(usersCount == 0) {
      return res.redirect('register')
    }


    return res.view('homepage', {
      angularDebugEnabled: process.env.NODE_ENV == 'production' ? false : true,
      konga_version: require('../package.json').version,
      accountActivated: req.query.activated ? true : false,
      loadScripts: true
    })
  },

  'GET /register' : async (req, res) => {

    const usersCount = await sails.models.user.count();

    if(usersCount > 0) {
      return res.redirect('')
    }

    return res.view('welcomepage', {
      angularDebugEnabled: process.env.NODE_ENV == 'production' ? false : true,
      konga_version: require('../package.json').version,
      accountActivated: req.query.activated ? true : false
    })
  },


  '/404': {
    view: '404'
  },

  '/500': {
    view: '500'
  },

  // First time registration
  'POST /register': 'AuthController.register',


  // Authentication routes
  '/logout': 'AuthController.logout',
  'POST /login': 'AuthController.callback',
  'POST /login/:action': 'AuthController.callback',
  'POST /auth/local': 'AuthController.callback',
  'POST /auth/local/:action': 'AuthController.callback',
  'POST /auth/signup': 'AuthController.signup',
  'GET /auth/activate/:token': 'AuthController.activate',
  '/auth/:provider': 'AuthController.provider',
  '/auth/:provider/callback': 'AuthController.callback',
  '/auth/:provider/:action': 'AuthController.callback',


  //'POST /consumers/sync'                 : 'ConsumerController.sync',



  // Kong 0.10.x certificates routes
  // These must be handled by KONGA
  // 'POST /kong/certificates': 'KongCertificatesController.upload',
  // 'PATCH /kong/certificates/:id': 'KongCertificatesController.update',


  // Snapshots
  'POST /api/snapshots/take': 'SnapshotController.takeSnapShot',
  'POST /api/snapshots/snapshot': 'SnapshotController.snapshot',
  'GET /api/snapshots/subscribe': 'SnapshotController.subscribe',
  'POST /api/snapshots/:id/restore': 'SnapshotController.restore',
  'GET /api/snapshots/:id/download': 'SnapshotController.download',

  // KongServices
  'GET /api/kongservices/tags': 'KongServicesController.listTags',

  // Socket Subscriptions
  'GET /api/kongnodes/healthchecks/subscribe': 'KongNodeController.subscribeHealthChecks',
  'GET /api/apis/healthchecks/subscribe': 'ApiHealthCheckController.subscribeHealthChecks',
  'GET /api/user/:id/subscribe': 'UserController.subscribe',

  // ApiHealthCheckController
  'DELETE /api/healthchecks/reset': 'ApiHealthCheckController.reset',

  // Rich Plugins List
  'GET /api/kong_plugins/list': 'KongPluginsController.list',
  'GET /api/schemas/authentication': 'KongSchemasController.authentication',


  // Consumer portal
  'GET /api/kong_consumers/:id/apis': 'KongConsumersController.apis',
  'GET /api/kong_consumers/:id/services': 'KongConsumersController.services',
  'GET /api/kong_consumers/:id/routes': 'KongConsumersController.routes',


  'GET /api/kong_services/:id/consumers': 'KongServicesController.consumers',
  'GET /api/kong_routes/:id/consumers': 'KongRoutesController.consumers',


  'GET /api/settings': 'SettingsController.find',
  'GET /api/settings/integrations': 'SettingsController.getIntegrations',


  /**
   * Fix Kong 1.x Listing routes
   */

  'GET /kong/:entity': 'KongProxyController.listProxy',
  'GET /kong/:entity/:id': 'KongProxyController.proxy',
  'GET /kong/:entity/:id/:child_entity': 'KongProxyController.listProxy',


  /**
   * Fallback to proxy
   */

  'GET /kong': 'KongProxyController.proxy',
  'GET /kong/*': 'KongProxyController.listProxy',
  'POST /kong/*': 'KongProxyController.proxy',
  'PUT /kong/*': 'KongProxyController.proxy',
  'PATCH /kong/*': 'KongProxyController.proxy',
  'DELETE /kong/*': 'KongProxyController.proxy'


};
