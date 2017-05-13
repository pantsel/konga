var fs = require('fs');

// Methods
module.exports = {
    getSchemas : function(req,res) {
        fs.readdir(__dirname, function(err, files) {
            if(err) return res.negotiate(err)
            var schemas = {}
            files.forEach(function(file) {
                if(file.indexOf('index') < 0) {
                    var fileData = require('./' + file)
                    if(fileData.enabled)
                        schemas[file.replace(".js","")] = fileData.schema
                }
            });
            res.json(schemas)
        })
    }
}

// Export the actual adapters
var files = fs.readdirSync(__dirname)
files.forEach(function(file) {
    if(file.indexOf('index') < 0 && file.indexOf('credentials') < 0) {
        module.exports[file.replace(".js","")] = require('./' + file)
    }
})
