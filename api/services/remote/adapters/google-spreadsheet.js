var fs = require('fs');
var google = require('googleapis');
var path = require('path')
var mkdirp = require('mkdirp');

module.exports = {
    enabled : true,
    schema : {
        "name": "Google Spreadsheet",
        "value": "google-spreadsheet",
        "hasFiles" : true,
        "description": "Import Consumers from Google spreadsheets. ",
        "info" :  "Konga uses the JWT method to authenticate with Google spreadsheets API." +
        "Make sure you have created <a href='https://developers.google.com/identity/protocols/application-default-credentials'>Service account JSON credentials</a> for Konga " +
        "and that your spreadsheet is shared with that service account's email.",
        "form_fields": {
            "connection": {
                "file" : {
                    "name" : "JSON credentials file",
                    "type" : "file",
                    "description" : "The Service account JSON credentials file." +
                    "This file only needs to be uploaded once as long as the service account remains as is."
                },
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
                "ignore_first_row": {
                    "name": "Ignore first row",
                    "type": "boolean",
                    "description": "Whether or not to ignore the first row of the spreadsheet." +
                    " This can be useful in case it contains the column titles."
                },
            },
            "consumer": {
                "username": {
                    "name": "username column",
                    "type": "number",
                    "required": true,
                    "description": "The index of the spreadsheet column that will be used as the consumer <code>username</code>. The first column is 0."
                },
                "custom_id": {
                    "name": "custom_id column",
                    "type": "number",
                    "required": true,
                    "description": "The index of the spreadsheet column that will be used as the consumer <code>custom_id</code>. The first column is 0."
                }
            }
        }
    },
    methods : {
        loadConsumers : function(req,res) {

            req.file('file').upload(function (err, uploadFiles) {
                if (err) return res.negotiate(err);

                var CREDENTIALS_PATH = path.join(__dirname,"..","credentials/google-spreadsheets");

                mkdirp(CREDENTIALS_PATH, function (err) {
                    if (err) return res.negotiate(err)

                    if(!uploadFiles.length && !fs.existsSync(CREDENTIALS_PATH + "/credentials.json")) {
                        if (err) return res.notFound("Credentials JSON file not found. You will need to upload one.");
                    }

                    if(uploadFiles[0]) {
                        fs.renameSync(uploadFiles[0].fd, CREDENTIALS_PATH + "/credentials.json");
                    }

                    var SCOPES = ['https://www.googleapis.com/auth/spreadsheets.readonly'];

                    fs.readFile(CREDENTIALS_PATH + "/credentials.json", function(err, content) {
                        if (err) if (err) return res.negotiate(err);

                        var key = JSON.parse(content);


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
                                    response.values.forEach(function(value,index){
                                        consumers.push({
                                            username : value[req.body.username],
                                            custom_id : value[req.body.custom_id],
                                        })
                                    })

                                    // Remove first item if specified
                                    if(req.body.ignore_first_row === 'true') {
                                        consumers.shift()
                                    }

                                    return res.json(consumers)
                                }
                            });
                        }
                    })
                });

                });






        }
    }

}
