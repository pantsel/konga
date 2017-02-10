#!/usr/bin/env node bin
var argv = require('minimist')(process.argv.slice(2));
var child_process = require('child_process');
var spawn = child_process.spawn
var isWin = /^win/.test(process.platform);
var path = require('path')


var front_settings = require('../frontend/config/config.json') || require('../frontend/config/config_example.json');
var back_settings = require('../backend/config/local') || require('../backend/config/local_example');




if (argv._[0] === 'help') {
    console.log("Usage:");
    logHelp()
    process.exit()
}
else if (argv._[0] === 'build')
{

    var cmd = spawn('npm' + ( isWin ? '.cmd' : '' ),
        ["install"],
        {cwd: '../' ,stdio: "inherit"});
    cmd.on('exit', function(code){
        console.log(code);
    });
}
else if (argv._[0] === 'play')
{
    var env   = argv._[1] || 'development'

    if(env !== 'production' && env !== 'development') {
        console.error("Invalid environment")
        console.log("Try 'production' or 'development'")
        return false;
    }

    var fport = process.env.KONGA_FRONTEND_PORT || argv.frontend || front_settings.frontend.ports[env]
    var bport = process.env.KONGA_PORT || argv.backend || back_settings.port

    console.log("------------------------------------------------------")
    console.log("Playing Konga!")
    console.log("")
    console.log("Environment : " + env)
    console.log("")
    console.log("Ports")
    console.log("frontend    : " + fport)
    console.log("backend     : " + bport)
    console.log("------------------------------------------------------")
    console.log("")

    // Lift backend
    var cmdBack = spawn('sails' + ( isWin ? '.cmd' : '' ),
        [
            "lift",
            "--port=" + bport,
            env === 'production' ? "--prod" : "--dev"
        ],
        {cwd : path.join(__dirname,"..","backend"), stdio: "inherit"});
    cmdBack.on('exit', function(code){
        console.log("Exiting",code);
    });

    var cmdFront = spawn('gulp' + ( isWin ? '.cmd' : '' ),
        [
            env === 'production' ? "production" : "serve",
            "--p=" + fport
        ],
        {cwd: path.join(__dirname,"..","frontend") ,stdio: "inherit"});
    cmdFront.on('exit', function(code){
        console.log(code);
    });



}
else if (argv._[0] === 'dist')
{
    // Generate distribution content
    var cmd = spawn('gulp' + ( isWin ? '.cmd' : '' ),
        ["dist"],
        {cwd: '../frontend' ,stdio: "inherit"});
    cmd.on('exit', function(code){
        console.log(code);
    });

}
else
{
    console.log(argv)
    console.log("Unknown command. Try one of these");
    logHelp()
}

function logHelp() {
    console.log("==========================================================================================================================================");
    console.log("konga build                                           | Install dependencies.");
    console.log("konga dist                                            | Create production-ready code to frontend/dist ready to be served by any web server");
    console.log("konga play [development --frontend="+front_settings.frontend.ports.development+" -backend="+back_settings.port+"] | Start frontend and backend servers using the specified environment and ports.");
    process.exit()
}
