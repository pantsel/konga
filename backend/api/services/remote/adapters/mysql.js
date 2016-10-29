var mysql = require('../../../../node_modules/sails-mysql/node_modules/mysql')
var mongodb = require('../../../../node_modules/sails-mongo/lib/connection')

module.exports = {
    schema : {
        "name": "MySQL",
        "value": "mysql",
        "description": "Import Consumers from a MySQL database table",
        "form_fields": {
            "connection": {
                "host": {
                    "name": "host",
                    "type": "text",
                    "description": "The database host. Defaults to localhost"
                },
                "user": {
                    "name": "user",
                    "type": "text",
                    "description": "The database user. Defaults to root"
                },
                "password": {
                    "name": "password",
                    "type": "text",
                    "description": "The database user\"s password."
                },
                "database": {
                    "name": "database",
                    "type": "text",
                    "required": true,
                    "description": "The database to connect to."
                }
            },
            "consumer": {
                "table": {
                    "name": "table",
                    "type": "text",
                    "required": true,
                    "description": "The table containing the consumers that will be imported to Kong."
                },
                "username": {
                    "name": "username field",
                    "type": "text",
                    "required": true,
                    "description": "The table field that will be used as the consumers <code>username</code>."
                },
                "custom_id": {
                    "name": "custom_id field",
                    "type": "text",
                    "required": true,
                    "description": "The table field that will be used as the consumers <code>custom_id</code>."
                }
            }
        }
    },
    methods : {
        loadConsumers : function(req,res) {

            var connection = mysql.createConnection({
                host : req.query.host || 'localhost',
                user : req.query.user || 'root',
                password : req.query.password || '',
                database : req.query.database || ''
            });

            connection.connect(function(err) {
                if (err) return res.negotiate(err);
                connection.query('SELECT ' + req.query.username + ' as username,' + req.query.custom_id + ' as custom_id FROM ' + req.query.table, function(err, rows, fields) {
                    if (err) return res.negotiate(err);
                    return res.json(rows);
                });
            });
        }
    }

}
