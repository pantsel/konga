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

var fs = require('fs');

module.exports = {
  /***************************************************************************
   * Set the default database connection for models in the development       *
   * environment (see config/connections.js and config/models.js )           *
   ***************************************************************************/

  hookTimeout: process.env.KONGA_HOOK_TIMEOUT || 60000,

  port: process.env.PORT || 1337,

  host: process.env.HOST || "0.0.0.0",

  // kong_admin_url: process.env.KONG_ADMIN_URL || 'http://127.0.0.1:8001',

  ssl: {
    key: process.env.SSL_KEY_PATH ? fs.readFileSync(process.env.SSL_KEY_PATH) : null,
    cert: process.env.SSL_CRT_PATH ? fs.readFileSync(process.env.SSL_CRT_PATH) : null
  },

  log: {
    level: process.env.KONGA_LOG_LEVEL || "debug"
  }
};
