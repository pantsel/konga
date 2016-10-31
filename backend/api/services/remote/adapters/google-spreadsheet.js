var fs = require('fs');
var google = require('googleapis');

module.exports = {
    schema : {
        "name": "Google Spreadsheet",
        "value": "google-spreadsheet",
        "description": "Import Consumers from Google spreadsheets",
        "form_fields": {
            "connection": {
                "spreadsheetId": {
                    "name": "spreadsheetId",
                    "type": "text",
                    "required" : true,
                    "description": "The long id in the sheets URL"
                },
                "range": {
                    "name": "range",
                    "type": "text",
                    "required" : true,
                    "description": "The range to read, in A1 notation. ex. A1:B15"
                },
            },
            "consumer": {
                "username": {
                    "name": "username column",
                    "type": "number",
                    "required": true,
                    "description": "The spreadsheet column that will be used as the consumer <code>username</code>. The first column is 0."
                },
                "custom_id": {
                    "name": "custom_id column",
                    "type": "number",
                    "required": true,
                    "description": "The spreadsheet column that will be used as the consumer <code>custom_id</code>. The first column is 0."
                }
            }
        }
    },
    methods : {
        loadConsumers : function(req,res) {

            var SCOPES = ['https://www.googleapis.com/auth/spreadsheets.readonly'];

            // Load client secrets from a local file.
            var key = require('../credentials/google-spreadsheet/konga-84413cd1c5f8.json')

            var jwtClient = new google.auth.JWT(
                key.client_email,
                null,
                key.private_key,
                SCOPES,
                null
            );

            jwtClient.authorize(function (err, tokens) {
                if (err) return res.negotiate(err)
                listConsumers(jwtClient)
            });

            function listConsumers(auth) {
                var sheets = google.sheets('v4');
                sheets.spreadsheets.values.get({
                    auth: auth,
                    spreadsheetId: req.body.spreadsheetId,
                    range : req.body.range,
                }, function(err, response) {
                    if (err) return res.negotiate(err)

                    //var rows = response.values;
                    if (response.length == 0 || response.values.length == 0) {
                        return res.notFound('No data found.')
                    } else {
                        //if(response.values.length > 200) return res.badRequest("Too many results! Maximum number of allowed results is 200")
                        var consumers = []
                        response.values.forEach(function(value){
                            consumers.push({
                                username : value[req.body.username],
                                custom_id : value[req.body.custom_id],
                            })
                        })
                        return res.json(consumers)
                    }
                });
            }

        }
    }

}
