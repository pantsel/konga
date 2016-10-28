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

  // Authentication routes
  '/logout': 'AuthController.logout',
  'POST /login': 'AuthController.callback',
  'POST /login/:action': 'AuthController.callback',
  'POST /auth/local': 'AuthController.callback',
  'POST /auth/local/:action': 'AuthController.callback',

  '/auth/:provider': 'AuthController.provider',
  '/auth/:provider/callback': 'AuthController.callback',
  '/auth/:provider/:action': 'AuthController.callback',


  /**
   * ------------------------------------------------------------------------
   * KONG ROUTES
   * ------------------------------------------------------------------------
   */

  // Informational routes
  'GET /kong/info'                      : 'KongInfoController.info',
  'GET /kong/info/status'               : 'KongInfoController.status',
  'GET /kong/info/cluster'              : 'KongInfoController.cluster',
  'DELETE /kong/info/cluster'           : 'KongInfoController.deleteCluster',

  // Api routes
  'POST /kong/apis'                     : 'KongApiController.create',
  'GET /kong/apis/:id'                  : 'KongApiController.retrieve',
  'GET /kong/apis'                      : 'KongApiController.list',
  'PATCH /kong/apis/:id'                : 'KongApiController.update',
  'PUT /kong/apis/'                     : 'KongApiController.updateOrCreate',
  'DELETE /kong/apis/:id'               : 'KongApiController.delete',

  // Consumer routes
  'POST /kong/consumers'                : 'KongConsumerController.create',
  'POST /kong/consumers/:id/acls'       : 'KongConsumerController.addAcl',
  'GET /kong/consumers/:id/key-auth'    : 'KongConsumerController.retrieveKeys',
  'GET /kong/consumers/:id/jwt'         : 'KongConsumerController.retrieveJWT',
  'POST /kong/consumers/:id/key-auth'   : 'KongConsumerController.createKey',
  'POST /kong/consumers/:id/jwt'        : 'KongConsumerController.createJWT',
  'GET /kong/consumers/:id'             : 'KongConsumerController.retrieve',
  'GET /kong/consumers/:id/acls'        : 'KongConsumerController.retrieveAcls',
  'GET /kong/consumers'                 : 'KongConsumerController.list',
  'PATCH /kong/consumers/:id'           : 'KongConsumerController.update',
  'PUT /kong/consumers'                 : 'KongConsumerController.updateOrCreate',
  'DELETE /kong/consumers/:id'          : 'KongConsumerController.delete',
  'DELETE /kong/consumers/:id/acls/:aclId'  : 'KongConsumerController.deleteAcl',
  'DELETE /kong/consumers/:id/key-auth/:keyId'  : 'KongConsumerController.deleteKey',
  'DELETE /kong/consumers/:id/jwt/:jwtId'  : 'KongConsumerController.deleteJWT',



  'GET /kong/consumers/:id/basic-auth'    : 'KongConsumerController.retrieveBasicAuthCredentials',
  'POST /kong/consumers/:id/basic-auth'   : 'KongConsumerController.createBasicAuthCredentials',
  'DELETE /kong/consumers/:id/basic-auth/:credentialId'  : 'KongConsumerController.deleteBasicAuthCredentials',


  'GET /kong/consumers/:id/hmac-auth'    : 'KongConsumerController.retrieveHMACAuthCredentials',
  'POST /kong/consumers/:id/hmac-auth'   : 'KongConsumerController.createHMACAuthCredentials',
  'DELETE /kong/consumers/:id/hmac-auth/:credentialId'  : 'KongConsumerController.deleteHMACAuthCredentials',


  // Plugin routes
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
  'GET /remote/consumers'                : 'RemoteStorageController.loadConsumers',
  'GET /remote/connection/test'          : 'RemoteStorageController.testConnection',


};
