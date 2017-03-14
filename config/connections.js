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
    adapter: 'sails-disk'
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
    host: process.env.MYSQL_HOST || 'localhost',
    user: process.env.MYSQL_USER || 'root',
    password: process.env.MYSQL_PASSWORD || null,
    database: process.env.MYSQL_DATABASE || 'konga_database'
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
    host: process.env.MONGO_HOST || 'localhost',
    port: process.env.MONGO_PORT || 27017,
    user: process.env.MONGO_USER ||  null,
    password: process.env.MONGO_PASSWORD ||  null,
    database: process.env.MONGO_DATABASE ||  'konga_database',
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
    host: process.env.PG_HOST || 'localhost',
    user:  process.env.PG_USER || 'postgres',
    password: process.env.PG_PASSWORD || 'admin1!',
    port: process.env.PG_PORT || 5432,
    database: process.env.PG_DATABASE ||'konga_database',
    poolSize: process.env.PG_POLLSIZE || 10,
    ssl: process.env.PG_SSL || false
  },

  /**
   * More adapters:
   * https://github.com/balderdashy/sails
   */
};
