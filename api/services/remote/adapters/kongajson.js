var unirest = require('unirest')

module.exports = {
    enabled : false,
    schema : {
        "name": "Konga JSON export",
        "value": "kongajson",
        "description": "Import previously exported Consumers",
        "hasFiles" : true,
        "form_fields": {
            "connection": {
                "file": {
                    "name": "File",
                    "required" : true,
                    "type": "file",
                    "description": "The JSON file containing the exported consumers"
                },
                "keepids" : {
                    name : "Keep Ids",
                    "type" : "boolean",
                    "default" : false,
                    description : "Keep exported consumers Ids"
                },
            }
        }
    },
    methods : {
        loadConsumers : function(req,res) {


            req.file('file').upload(function (err, uploadFiles) {

                if(err) return res.negotiate(err);


                if(!uploadFiles.length) return res.badRequest("No files uploaded")


                var jsonData = require(uploadFiles[0].fd)

                var keepIds = req.body.keepids || false

                if(!keepIds) {
                    jsonData.forEach(function(item){
                        delete item.id
                    })
                }


                return res.json(jsonData.data)

            });
        }
    }

}
