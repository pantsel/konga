'use strict';
/**
 * Development environment settings
 *
 * This file can include shared settings for a development team,
 * such as API keys or remote database passwords.  If you're using
 * a version control solution for your Sails app, this file will
 * be committed to your repository unless you add it to your .gitignore
 * file.  If your repository will be publicly viewable, don't add
 * any private information to this file!
 *
 */
module.exports = {
  /***************************************************************************
   * Set the default database connection for models in the development       *
   * environment (see config/connections.js and config/models.js )           *
   ***************************************************************************/

  hookTimeout: 60000,

  port: process.env.KONGA_BACKEND_PORT || 1337,

  kong_admin_url : process.env.KONG_ADMIN_URL || 'http://127.0.0.1:8001',
  kong_admin_username : process.env.KONG_ADMIN_USERNAME || '',
  kong_admin_password : process.env.KONG_ADMIN_PASSWORD || '',
  kong_admin_basic_auth_enabled : process.env.KONG_ADMIN_BASIC_AUTH_ENABLED || '',


  // models: {
  //   connection: 'someMongodbServer'
  // }
};
