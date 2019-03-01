/**
 * Created by user on 06/10/2017.
 */

'use strict'

var mysql = require("../../node_modules/sails-mysql/node_modules/mysql");
var dbConf = require("../../config/connections");
var URL = require('url');
var _ = require('lodash');


function parse(uri) {

  var parsed =  URL.parse(uri);

  return {
    user: parsed.auth.split(":")[0],
    password: parsed.auth.split(":")[1] || null,
    host: parsed.hostname,
    port: parsed.port,
    database: parsed.pathname.replace('/', '')
  }
}

module.exports = {
  run : function (next) {
    console.log("Using MySQL DB Adapter.");
    return this.create(next);
  },


  create : function(next) {

    var parsedOpts;
    var url = dbConf.connections.mysql.url;
    if(url) {
      parsedOpts = parse(url);
    }


    var connection = mysql.createConnection(url ? _.omit(parsedOpts,['database']) : {
      host     : dbConf.connections.mysql.host,
      port     : dbConf.connections.mysql.port,
      user     : dbConf.connections.mysql.user,
      password : dbConf.connections.mysql.password
    });

    console.log("Creating database `" + ( parsedOpts ? parsedOpts.database : dbConf.connections.mysql.database ) + "` if not exists.");

    connection.query('CREATE DATABASE IF NOT EXISTS ' + ( parsedOpts ? parsedOpts.database : dbConf.connections.mysql.database ), function (error, results, fields) {
      if (error) {
        console.error(error);
        return next(error);
      }

      return next();
    });
  }
}