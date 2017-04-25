var unirest = require('unirest')

module.exports = {
    schema : {
        "name": "Konga JSON export",
        "value": "kongajson",
        "description": "Import previously exported Consumers",
        "form_fields": {
            "connection": {
                "endpoint": {
                    "name": "kongajson",
                    "required" : true,
                    "type": "file",
                    "description": "The JSON file containing the exported consumers"
                },
            },
            "consumer": {

            }
        }
    },
    methods : {
        loadConsumers : function(req,res) {

            var headers = {}
            if(req.param('headers')) {
                var string = req.param('headers')
                var split = string.split(",")
                split.forEach(function(keyVal){
                    var array = keyVal.split(":")
                    headers[array[0]] = array[1]
                })

                console.log("Headers =>",headers)
            }

            var request = unirest.get(req.param('endpoint'))
            request.headers(headers)
            request.end(function (response) {
                if (response.error)  return res.negotiate(response)

                console.log("response.body",response.body)

                var jsonRes = response.body

                return res.json(req.param('data_property') ? jsonRes[req.param('data_property')] : jsonRes)
            })
        }
    }

}
