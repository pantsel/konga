var connect = require('connect');
var serveStatic = require('serve-static');
var path = require('path')
var port = process.env.PORT || 3000
//var isWin = /^win/.test(process.platform);
//var child_process = require('child_process');
//var spawn = child_process.spawn
//
//// First of all, create distribution files
//var cmdBack = spawn('gulp' + ( isWin ? '.cmd' : '' ),
//    [
//        "dist"
//    ],
//    {cwd : path.join(__dirname,"."), stdio: "inherit"});
//cmdBack.on('exit', function(code){
//
//    if(code == 0) {
//        connect().use(serveStatic(path.join(__dirname,'dist'))).listen(port, function(){
//            console.log('Server running on ' + port);
//        });
//    }else{
//        console.log("Cannot start frontend. Build process failed with exitCode: ",code);
//    }
//
//});


connect().use(serveStatic(path.join(__dirname,'dist'))).listen(port, function(){
    console.log('Server running on ' + port);
});






