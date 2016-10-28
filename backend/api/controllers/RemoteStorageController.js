'use strict';

var unirest = require('unirest');
var mysql = require('../../node_modules/sails-mysql/node_modules/mysql')

/**
 * Authentication Controller
 *
 * This is merely meant as an example of how your Authentication controller should look. It currently
 * includes the minimum amount of functionality for the basics of Passport.js to work.
 */
var RemoteStorageController = {
    testConnection : function(req,res) {

        console.log(req.query)
        var connection = mysql.createConnection({
            host : req.query.host || '',
            user : req.query.user || 'root',
            password : req.query.password || '',
            database : req.query.database || ''
        });
        connection.connect(function(err) {
            if (err) return res.negotiate(err);
            connection.query('SELECT 1 from ' + req.query.table, function(err, rows, fields) {
                if (err) return res.negotiate(err);
                return res.json(rows);
            });
        });
    },

    loadConsumers : function(req,res) {
        console.log(req.query)

        req.query.fields = JSON.parse(req.query.fields)

        var connection = mysql.createConnection({
            host : req.query.host || '',
            user : req.query.user || 'root',
            password : req.query.password || '',
            database : req.query.database || ''
        });
        connection.connect(function(err) {
            if (err) return res.negotiate(err);
            connection.query('SELECT ' + req.query.fields.username + ' as username,' + req.query.fields.custom_id + ' as custom_id FROM ' + req.query.table, function(err, rows, fields) {
                if (err) return res.negotiate(err);
                return res.json(rows);
            });
        });
    },
};

module.exports = RemoteStorageController;
