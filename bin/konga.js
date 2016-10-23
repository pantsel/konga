#!/usr/bin/env node
var parseArgs = require('minimist');
var child_process = require('child_process');
var spawn = require('child_process').spawn
var argv = parseArgs(process.argv.slice(2));
var isWin = /^win/.test(process.platform);

if (argv._[0] === 'help') {
    console.log("Usage:");
    logHelp()
    process.exit()
}
else if (argv._[0] === 'build')
{

    var cmd = isWin ? 'npm.cmd' : 'npm'
    var cmd = spawn('npm' + + ( isWin ? '.cmd' : '' ),
        ["install"],
        {cwd: '../' ,stdio: "inherit"});
    cmd.on('exit', function(code){
        console.log(code);
    });
}
else if (argv._[0] === 'play')
{
    if(!argv._[1])
    {
        // Lift backend
        var cmdBack = spawn('sails' + ( isWin ? '.cmd' : '' ),
            ["lift"],
            {cwd: '../backend' ,stdio: "inherit"});
        cmdBack.on('exit', function(code){
            console.log(code);
        });

        // Serve frontend
        var cmdFront = spawn('gulp' + ( isWin ? '.cmd' : '' ),
            ["serve"],
            {cwd: '../frontend' ,stdio: "inherit"});
        cmdFront.on('exit', function(code){
            console.log(code);
        });
    }
    else if (argv._[1] && argv._[1] === 'production')
    {
        // Lift backend
        var cmdBack = spawn('sails' + ( isWin ? '.cmd' : '' ),
            ["lift","--prod"],
            {cwd: '../backend' ,stdio: "inherit"});
        cmdBack.on('exit', function(code){
            console.log(code);
        });

        // Serve frontend
        var cmdFront = spawn('gulp' + ( isWin ? '.cmd' : '' ),
            ["production"],
            {cwd: '../frontend' ,stdio: "inherit"});
        cmdFront.on('exit', function(code){
            console.log(code);
        });
    }
    else
    {
        console.log("Usage:");
        console.log("Invalid option: '" + argv._[1] + "'");
        logHelp()
    }

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
    console.log("Unknown command. Try one of these");
    logHelp()
}

function logHelp() {
    console.log("==================================================================================================================");
    console.log("konga build                   | Install dependencies.");
    console.log("konga dist                    | Create production-ready code to frontend/dist ready to be served by any web server");
    console.log("konga play [-env development] | Start frontend and backend servers using the specified environment.");
    process.exit()
}
