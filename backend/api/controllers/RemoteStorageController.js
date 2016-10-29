'use strict';

var unirest = require('unirest');
var RemoteStorageService = require('../services/remote/RemoteStorageService')
var adapters = require('../services/remote/adapters')

/**
 * Authentication Controller
 *
 * This is merely meant as an example of how your Authentication controller should look. It currently
 * includes the minimum amount of functionality for the basics of Passport.js to work.
 */
var RemoteStorageController = {

    loadAdapters : function(req,res) {
        return adapters.getSchemas(req,res)
    },

    testConnection : function(req,res) {

        return new RemoteStorageService(req.adapter).loadConsumers(req,res)
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
        return new RemoteStorageService(req.query.adapter).loadConsumers(req,res)
    },
};

module.exports = RemoteStorageController;
