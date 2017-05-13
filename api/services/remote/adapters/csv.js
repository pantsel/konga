var csv = require('csv-parser')
var fs = require('fs')

module.exports = {
    enabled : true,
    schema : {
        "name": "CSV",
        "value": "csv",
        "hasFiles" : true,
        "description": "Import Consumers from a .csv document",
        "form_fields": {
            "connection": {
                "file" : {
                    "name" : "File",
                    "type" : "file",
                    "required": true,
                    "description" : "Select the .csv document containing the consumers"
                },
                "raw" : {
                    name : "raw",
                    "type" : "boolean",
                    "default" : false,
                    description : "Whether or not to decode to utf-8 strings (optional)."
                },
                "separator" : {
                    name : "separator",
                    "type" : "text",
                    description : "Specify optional cell separator. Defaults to <code>','</code>"
                },
                "quote" : {
                    name : "quote",
                    "type" : "text",
                    description : "Specify optional quote character. Defaults to <code>'\"'</code>"
                },
                "escape" : {
                    name : "escape",
                    "type" : "text",
                    description : "Specify optional escape character. Defaults to quote value"
                },
                "newline" : {
                    name : "newline",
                    "type" : "text",
                    description : "Specify a newline character. Defaults to <code>'\\n'</code>"
                },
                "strict" : {
                    name : "strict",
                    "type" : "boolean",
                    "default" : true,
                    description : "Require column length match headers length (optional)."
                },

                "headers" : {
                    name : "headers",
                    "type" : "text",
                    "required": true,
                    "description" : "Specify the headers of each .csv row as a comma separated string." +
                    " ex: <code>'id,name,email,updated_at,created_at...'</code>"
                }
            },
            "consumer": {
                "username": {
                    "name": "username column",
                    "type": "text",
                    "required": true,
                    "description": "The header of the cell that will be used as the consumer <code>username</code>."
                },
                "custom_id": {
                    "name": "custom_id field",
                    "type": "text",
                    "required": true,
                    "description": "The header of the cell that will be used as the consumer <code>custom_id</code>."
                }
            }
        }
    },
    methods : {
        loadConsumers : function(req,res) {

            req.file('file').upload(function (err, uploadFiles) {

                if(err) return res.negotiate(err);

                if(!uploadFiles.length) return res.badRequest("No files uploaded")

                var result = [];

                fs.createReadStream(uploadFiles[0].fd)
                    .pipe(csv({
                        raw: req.body.raw ||  false,     // do not decode to utf-8 strings
                        separator: req.body.separator || ',', // specify optional cell separator
                        quote: req.body.quote || '"',     // specify optional quote character
                        escape: req.body.escape || '"',    // specify optional escape character (defaults to quote value)
                        newline: req.body.newline || '\n',  // specify a newline character
                        strict: req.body.strict || true,   // require column length match headers length
                        headers: req.body.headers.split(",") // Specifing the headers
                    }))
                    .on('data', function (data) {
                        var consumer = {}
                        Object.keys(data).forEach(function(key){

                            if(key === req.body.username) {
                                consumer.username = data[key]
                            }

                            if(key === req.body.custom_id) {
                                consumer.custom_id = data[key]
                            }
                        })

                        if(Object.keys(data).length === 2)
                            result.push(consumer);
                    })
                    .on('end', function () {
                        if(!result.length)
                            return res.notFound("No consumers found");
                        return res.json(result)
                    })

            });


        }
    }

}
