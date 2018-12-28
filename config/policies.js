'use strict';

/**
 * Policy Mappings
 * (sails.config.policies)
 *
 * Policies are simple functions which run **before** your controllers.
 * You can apply one or more policies to a given controller, or protect
 * its actions individually.
 *
 * Any policy file (e.g. `api/policies/authenticated.js`) can be accessed
 * below by its filename, minus the extension, (e.g. "authenticated")
 *
 * For more information on how policies work, see:
 * http://sailsjs.org/#/documentation/concepts/Policies
 *
 * For more information on configuring policies, check out:
 * http://sailsjs.org/#/documentation/reference/sails.config/sails.config.policies.html
 */
module.exports.policies = {
  // Default policy for all controllers and actions
  '*': ['authenticated'],

  AuthController: {
    'checkPassword': ['authenticated'],
    'signup': ['signup', 'createUser'],
    '*': ['passport'],

  },

  KongInfoController: {
    '*': ['authenticated', 'dynamicNode'],
  },

  KongApiController: {
    '*': ['authenticated', 'dynamicNode'],
  },

  KongConsumersController: {
    '*': ['authenticated', 'dynamicNode']
  },

  KongSchemasController: {
    '*': ['authenticated'],
  },

  KongPluginsController: {
    '*': ['authenticated', 'dynamicNode'],
  },

  KongServicesController: {
    '*': ['authenticated', 'dynamicNode'],
  },

  KongRoutesController: {
    '*': ['authenticated', 'dynamicNode'],
  },

  KongCertificatesController: {
    '*': ['authenticated', 'dynamicNode'],
  },

  ApiHealthCheckController: {
    '*': ['authenticated', 'dynamicNode'],
    'subscribeHealthChecks': ['authenticated'],
    'reset' : ['authenticated', 'dynamicNode', 'isAdmin']
  },


  // User controller
  UserController: {
    '*': ['authenticated'],
    'count': ['authenticated'],
    'find': ['authenticated'],
    'findOne': ['authenticated'],
    'create': ['authenticated', 'isAdmin', 'addDataCreate', 'createUser'],
    'update': ['authenticated', 'addDataUpdate', 'updateUser'],
    'destroy': ['authenticated', 'isAdmin', 'deleteUser'],
    'add': ['authenticated', 'isAdmin'],
    'remove': ['authenticated', 'isAdmin']
  },

  ApiController: {
    'proxy': ['authenticated', 'activeNodeData'],
  },

  ConsumerController: {
    '*': ['authenticated'],
    'count': ['authenticated', 'activeNodeData'],
    'find': ['authenticated', 'activeNodeData'],
    'findOne': ['authenticated', 'activeNodeData'],
    'create': ['authenticated', 'isAdmin', 'addDataCreate'],
    'update': ['authenticated', 'isAdmin', 'addDataUpdate'],
    'destroy': ['authenticated', 'isAdmin'],
    'add': ['authenticated', 'isAdmin'],
    'remove': ['authenticated', 'isAdmin'],
    'sync': ['authenticated', 'isAdmin', 'dynamicNode', 'activeNodeData'],
  },

  KongNodeController: {
    '*': ['authenticated'],
    'count': ['authenticated'],
    'find': ['authenticated'],
    'findOne': ['authenticated'],
    'create': ['authenticated', 'isAdmin', 'addDataCreate'],
    'update': ['authenticated', 'isAdmin', 'addDataUpdate'],
    'destroy': ['authenticated', 'isAdmin'],
    'add': ['authenticated', 'isAdmin'],
    'remove': ['authenticated', 'isAdmin']
  },

  // User controller
  KongGroupController: {
    '*': ['authenticated', 'dynamicNode'],
    'count': ['authenticated', 'dynamicNode'],
    'find': ['authenticated', 'dynamicNode'],
    'findOne': ['authenticated', 'dynamicNode'],
    'create': ['authenticated', 'isAdmin', 'dynamicNode', 'addDataCreate'],
    'update': ['authenticated', 'isAdmin', 'dynamicNode', 'addDataUpdate'],
    'destroy': ['authenticated', 'isAdmin', 'dynamicNode'],
    'add': ['authenticated', 'isAdmin', 'dynamicNode'],
    'remove': ['authenticated', 'isAdmin', 'dynamicNode']
  },

  NetdataConnectionController: {
    '*': ['authenticated'],
    'count': ['authenticated'],
    'find': ['authenticated'],
    'findOne': ['authenticated'],
    'create': ['authenticated', 'isAdmin', 'addDataCreate'],
    'update': ['authenticated', 'isAdmin', 'addDataUpdate'],
    'destroy': ['authenticated', 'isAdmin']
  },

  SnapshotController: {
    '*': ['authenticated'],
    'takeSnapShot': ['authenticated', 'isAdmin', 'dynamicNode', 'createUser'],
    'snapshot': ['authenticated', 'isAdmin', 'dynamicNode', 'createUser'],
    'restore': ['authenticated', 'isAdmin', 'dynamicNode'],
    'remove': ['authenticated', 'isAdmin'],
    'find': ['authenticated', 'isAdmin']
  },

  SnapshotScheduleController: {
    'create': ['authenticated', 'isAdmin', 'addDataCreate'],
    'update': ['authenticated', 'isAdmin', 'addDataUpdate'],
    'remove': ['authenticated', 'isAdmin'],
    'find': ['authenticated', 'isAdmin']
  },

  UpstreamAlertsController: {
    'create': ['authenticated', 'isAdmin', 'addDataCreate'],
    'update': ['authenticated', 'isAdmin', 'addDataUpdate'],
    'remove': ['authenticated', 'isAdmin'],
    'find': ['authenticated', 'isAdmin']
  },

  SettingsController: {
    'find': true,
    '*': ['authenticated', 'isAdmin'],
  },


  KongProxyController: {
    "*": ['authenticated', 'dynamicNode']
  }


};
