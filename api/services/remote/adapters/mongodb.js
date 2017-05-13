var MongoClient = require('mongodb').MongoClient;

module.exports = {
    enabled : true,
    schema : {
        "name": "MongoDB",
        "value": "mongodb",
        "description": "Import Consumers from a MongoDB collection",
        "form_fields": {
            "connection": {
                "host": {
                    "name": "host",
                    "type": "text",
                    "description": "The database host. Defaults to localhost"
                },
                "port": {
                    "name": "port",
                    "type": "number",
                    "description": "The database port. Defaults to 27017"
                },
                "user": {
                    "name": "user",
                    "type": "text",
                    "description": "The database user."
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
                    "description": "The database name."
                }
            },
            "consumer": {
                "collection": {
                    "name": "collection",
                    "type": "text",
                    "required": true,
                    "description": "The mongodb collection containing the consumers that will be imported to Kong."
                },
                "username": {
                    "name": "username field",
                    "type": "text",
                    "required": true,
                    "description": "The collection property that will be used as the consumer <code>username</code>."
                },
                "custom_id": {
                    "name": "custom_id field",
                    "type": "text",
                    "required": true,
                    "description": "The collection property that will be used as the consumer <code>custom_id</code>."
                }
            }
        }
    },
    methods : {
        loadConsumers : function(req,res) {

            var host     = req.body.host || 'localhost'
            var port     = req.body.port || 27017
            var user     =  req.body.user
            var password = req.body.password
            var database = req.body.database || 'sails'

            // Build connection string
            var m = 'mongodb://'
            var up = user ? user + ':' + password + '@' : ''
            var c = host + ':' + port + '/' + database;
            var url = m + up + c

            MongoClient.connect(url, function(err, db) {
                if (err) return res.negotiate(err);
                var collection = db.collection(req.body.collection || '');
                collection
                    .aggregate([
                        { "$group": {
                            "_id": "$_id",
                            "custom_id": { "$first": "$" + req.body.custom_id },
                            "username": { "$first": "$" + req.body.username },
                        }}

                    ]).toArray(function(err, docs) {
                    db.close(); // close the connection
                    if (err) return res.negotiate(err);
                    if(!docs.length) return res.notFound()
                    return res.json(docs)
                });
            });
        }
    }

}
