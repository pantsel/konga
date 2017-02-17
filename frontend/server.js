var connect = require('connect');
var serveStatic = require('serve-static');
var path = require('path')
connect().use(serveStatic(path.join(__dirname,'dist'))).listen(3000, function(){
    console.log('Server running on 3000...');
});