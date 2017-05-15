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
  'OPTIONS /*': function(req, res) {
    res.send(200);
  },

  '/': {
    view: 'homepage',
    locals: {
      angularDebugEnabled : process.env.NODE_ENV == 'production' ? false : true,
      konga_version : require('../package.json').version
    }
  },

  '/404': {
    view: 'homepage'
  },

  '/500': {
    view: '500'
  },

  // Authentication routes
  '/logout': 'AuthController.logout',
  'POST /login': 'AuthController.callback',
  'POST /login/:action': 'AuthController.callback',
  'POST /auth/local': 'AuthController.callback',
  'POST /auth/local/:action': 'AuthController.callback',

  'POST /auth/signup': 'AuthController.signup',

  '/auth/:provider': 'AuthController.provider',
  '/auth/:provider/callback': 'AuthController.callback',
  '/auth/:provider/:action': 'AuthController.callback',


  /**
   * ------------------------------------------------------------------------
   * KONG ROUTES
   * ------------------------------------------------------------------------
   */

 //'POST /consumers/sync'                 : 'ConsumerController.sync',

  // Informational routes
  'GET /kong/info'                      : 'KongInfoController.info',
  'GET /kong/status'                    : 'KongInfoController.status',
  'GET /kong/cluster'                   : 'KongInfoController.cluster',
  'DELETE /kong/cluster'                : 'KongInfoController.deleteCluster',

  // Api routes
  'POST /kong/apis'                     : 'KongApiController.create',
  'GET /kong/apis/:id'                  : 'KongApiController.retrieve',
  'GET /kong/apis'                      : 'KongApiController.list',
  'PATCH /kong/apis/:id'                : 'KongApiController.update',
  'PUT /kong/apis/'                     : 'KongApiController.updateOrCreate',
  'DELETE /kong/apis/:id'               : 'KongApiController.delete',


  'POST /kong/consumers'                : 'KongConsumerController.create',
  'POST /kong/consumers/:id/acls'       : 'KongConsumerController.addAcl',
  'GET /kong/consumers/:id'             : 'KongConsumerController.retrieve',
  'GET /kong/consumers/:id/acls'        : 'KongConsumerController.retrieveAcls',
  'GET /kong/consumers'                 : 'KongConsumerController.list',
  'PATCH /kong/consumers/:id'           : 'KongConsumerController.update',
  'PUT /kong/consumers'                 : 'KongConsumerController.updateOrCreate',
  'DELETE /kong/consumers/:id'          : 'KongConsumerController.delete',


  'GET /kong/consumers/:id/credentials'   : 'KongConsumerController.listCredentials',
  'GET /kong/consumers/:id/:credential'   : 'KongConsumerController.retrieveCredentials',
  'POST /kong/consumers/:id/:credential'   : 'KongConsumerController.createCredential',
  'DELETE /kong/consumers/:id/:credential/:credential_id'   : 'KongConsumerController.removeCredential',

  // Plugin routes
  'POST /kong/plugins'                  : 'KongPluginController.create',
  'DELETE /kong/plugins/:id'            : 'KongPluginController.delete',
  'PATCH /kong/plugins/:id'             : 'KongPluginController.update',


  'POST /kong/apis/:api/plugins'        : 'KongPluginController.create',
  'GET /kong/plugins/:id'               : 'KongPluginController.retrieve',
  'GET /kong/plugins/enabled'           : 'KongPluginController.retrieveEnabled',
  'GET /kong/plugins/schema/:plugin'    : 'KongPluginController.retrieveSchema',
  'GET /kong/plugins'                   : 'KongPluginController.list',
  'GET /kong/apis/:api/plugins'         : 'KongPluginController.listApi',
  'PATCH /kong/apis/:api/plugins/:id'   : 'KongPluginController.update',
  'PUT /kong/apis/:api/plugins'         : 'KongPluginController.updateOrCreate',
  'DELETE /kong/apis/:api/plugins/:id'  : 'KongPluginController.delete',

  // Remote Storage routes
  'GET /remote/adapters'                 : 'RemoteStorageController.loadAdapters',
  'POST /remote/consumers'               : 'RemoteStorageController.loadConsumers',
  'GET /remote/connection/test'          : 'RemoteStorageController.testConnection',



  // Kong 0.10.x certificates routes
  'POST /kong/certificates'                : 'KongCertificatesController.upload',
  'PATCH /kong/certificates/:id'                : 'KongCertificatesController.update',


    // Konga API
    'GET /api/consumers/:id/credentials' : 'KongaApiController.listConsumerCredentials',
    'PATCH /api/consumers/:id'           : 'KongaApiController.updateConsumer',
    'POST /api/consumers'                : 'KongaApiController.createConsumer',
    'POST /api/apis'                     : 'KongaApiController.registerApi',






    // Snapshots
    'POST /api/snapshots/take'                     : 'SnapshotController.takeSnapShot',
    'POST /api/snapshots/:id/restore'              : 'SnapshotController.restore',

  // Subscriptions
  'GET /api/kongnodes/healthchecks/subscribe'    : 'KongNodeController.subscribeHealthChecks',
  'GET /api/apis/healthchecks/subscribe'         : 'ApiHealthCheckController.subscribeHealthChecks',

  // Upstream routes
  //'GET /kong/upstreams'                      : 'KongUpstreamsController.list',


  /**
   * Fallback to proxy
   */

  'GET /api/*'    : 'ApiController.proxy',
  'POST /api/*'   : 'ApiController.proxy',
  'PUT /api/*'    : 'ApiController.proxy',
  'PATCH /api/*'  : 'ApiController.proxy',
  'DELETE /api/*' : 'ApiController.proxy'


};
