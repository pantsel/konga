/**
 * Created by pang on 7/10/2016.
 */
'use strict';

/**
 * Local environment settings
 *
 * While you're DEVELOPING your app, this config file should include
 * any settings specifically for your development computer (db passwords, etc.)
 *
 * When you're ready to deploy your app in PRODUCTION, you can always use this file
 * for configuration options specific to the server where the app will be deployed.
 * But environment variables are usually the best way to handle production settings.
 *
 * PLEASE NOTE:
 *      This file is included in your .gitignore, so if you're using git
 *      as a version control solution for your Sails app, keep in mind that
 *      this file won't be committed to your repository!
 *
 *      Good news is, that means you can specify configuration for your local
 *      machine in this file without inadvertently committing personal information
 *      (like database passwords) to the repo.  Plus, this prevents other members
 *      of your team from committing their local configuration changes on top of yours.
 *
 * For more information, check out:
 * http://links.sailsjs.org/docs/config/local
 */
module.exports = {

  /**
   * The default fallback URL to Kong's admin API.
   */
  // kong_admin_url : process.env.KONG_ADMIN_URL || 'http://127.0.0.1:8001',


  connections: {

  },

  models: {
    connection: process.env.DB_ADAPTER || 'localDiskDb',
  },

  session: {
    secret: '' // Add your own SECRET string here
  },
  port: process.env.PORT || 1338,
  environment: process.env.NODE_ENV || 'development',
  log: {
    level: 'info'
  }
};
