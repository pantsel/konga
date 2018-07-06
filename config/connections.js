'use strict';

/**
 * Connections
 * (sails.config.connections)
 *
 * `Connections` are like "saved settings" for your adapters.  What's the difference between
 * a connection and an adapter, you might ask?  An adapter (e.g. `sails-mysql`) is generic--
 * it needs some additional information to work (e.g. your database host, password, user, etc.)
 * A `connection` is that additional information.
 *
 * Each model must have a `connection` property (a string) which is references the name of one
 * of these connections.  If it doesn't, the default `connection` configured in `config/models.js`
 * will be applied.  Of course, a connection can (and usually is) shared by multiple models.
 * .
 * Note: If you're using version control, you should put your passwords/api keys
 * in `config/local.js`, environment variables, or use another strategy.
 * (this is to prevent you inadvertently sensitive credentials up to your repository.)
 *
 * For more information on configuration, check out:
 * http://sailsjs.org/#/documentation/reference/sails.config/sails.config.connections.html
 */
module.exports.connections = {
  /**
   * Local disk storage for DEVELOPMENT ONLY
   *
   * Installed by default.
   */
  localDiskDb: {
    adapter: 'sails-disk',
    filePath:  process.env.NODE_ENV == 'test' ? './.tmp/' : ( process.env.STORAGE_PATH || './kongadata/' ),
    fileName: process.env.NODE_ENV == 'test' ? 'localDiskDb.db' : 'konga.db'
  },

  /**
   * MySQL is the world's most popular relational database.
   * http://en.wikipedia.org/wiki/MySQL
   *
   * Run:
   * npm install sails-mysql
   */
  mysql: {
    adapter: 'sails-mysql',
    url: process.env.DB_URI || null,
    host: process.env.DB_HOST || 'localhost',
    port: process.env.DB_PORT || 3306,
    user: process.env.DB_USER || 'root',
    password: process.env.DB_PASSWORD || null,
    database: process.env.DB_DATABASE || 'konga_database'
  },

  /**
   * MongoDB is the leading NoSQL database.
   * http://en.wikipedia.org/wiki/MongoDB
   *
   * Run:
   * npm install sails-mongo
   */
  mongo: {
    adapter: 'sails-mongo',
    url: process.env.DB_URI || null,
    host: process.env.DB_HOST || 'localhost',
    port: process.env.DB_PORT || 27017,
    user: process.env.DB_USER ||  null,
    password: process.env.DB_PASSWORD ||  null,
    database: process.env.DB_DATABASE ||  'konga_database',
  },

  /**
   * PostgreSQL is another officially supported relational database.
   * http://en.wikipedia.org/wiki/PostgreSQL
   *
   * Run:
   * npm install sails-postgresql
   */
  postgres: {
    adapter: 'sails-postgresql',
    url: process.env.DB_URI,
    host: process.env.DB_HOST || 'localhost',
    user:  process.env.DB_USER || 'postgres',
    password: process.env.DB_PASSWORD || 'admin1!',
    port: process.env.DB_PORT || 5432,
    database: process.env.DB_DATABASE ||'konga_database',
    // schema: process.env.DB_PG_SCHEMA ||'public',
    poolSize: process.env.DB_POOLSIZE || 10,
    ssl: process.env.DB_SSL ? true : false // If set, assume it's true
  },

  /**
   * More adapters:
   * https://github.com/balderdashy/sails
   */

  'sqlserver': {
    adapter: 'sails-sqlserver',
    url: process.env.DB_URI || null,
    host: process.env.DB_HOST || 'localhost',
    user:  process.env.DB_USER || null,
    password: process.env.DB_PASSWORD || null,
    port: process.env.DB_PORT || 49150,
    database: process.env.DB_DATABASE ||'konga_database'
  },
};