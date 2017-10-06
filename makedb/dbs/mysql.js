/**
 * Created by user on 06/10/2017.
 */

'use strict'

var mysql = require("../../node_modules/sails-mysql/node_modules/mysql");
var dbConf = require("../../config/connections");

module.exports = {
    run : function (next) {
        console.log("Using MySQL DB Adapter.");
        return this.create(next);
    },


    create : function(next) {

        var connection = mysql.createConnection({
            host     : dbConf.connections.mysql.host,
            port     : dbConf.connections.mysql.port,
            user     : dbConf.connections.mysql.user,
            password : dbConf.connections.mysql.password
        });

        console.log("Creating database `" + dbConf.connections.postgres.database + "` if not exists.");

        connection.query('CREATE DATABASE IF NOT EXISTS ' + dbConf.connections.postgres.database, function (error, results, fields) {
            if (error) {
                console.error(error);
                return next(error);
            }

            return next();
        });
    }
}
