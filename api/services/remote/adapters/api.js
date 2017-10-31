var unirest = require('unirest')

module.exports = {
    enabled : true,
    schema : {
        "name": "API",
        "value": "api",
        "description": "Import Consumers by issuing a GET request to an API endpoint",
        "form_fields": {
            "connection": {
                "endpoint": {
                    "name": "endpoint",
                    "required" : true,
                    "type": "text",
                    "description": "The API endpoint. ex: <code>http://myapi.io/users?limit=3000</code>"
                },
                "headers": {
                    "name": "headers",
                    "type": "text",
                    "description": "A comma separated list of headers to send with the request. ex: <code>Authorization:Bearer some-token-key,Content-type:application/json</code>"
                }
            },
            "consumer": {
                "data_property" : {
                    "name": "Data property",
                    "type": "text",
                    "description": "If specified, the consumers will be extracted from this resulting object's property."
                },
                "username": {
                    "name": "username field",
                    "type": "text",
                    "required": true,
                    "description": "The property that will be used as the consumer <code>username</code>."
                },
                "custom_id": {
                    "name": "custom_id field",
                    "type": "text",
                    "required": true,
                    "description": "The property will be used as the consumer <code>custom_id</code>."
                }
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

                sails.log("Headers =>",headers)
            }

            var request = unirest.get(req.param('endpoint'))
            request.headers(headers)
            request.end(function (response) {
                if (response.error)  return res.negotiate(response)

                sails.log("response.body",response.body)

                var jsonRes = response.body

                return res.json(req.param('data_property') ? jsonRes[req.param('data_property')] : jsonRes)
            })
        }
    }

}
