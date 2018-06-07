#!/usr/bin/env node bin
var argv = require('minimist')(process.argv.slice(2));
var child_process = require('child_process');
var spawn = child_process.spawn
var isWin = /^win/.test(process.platform);
var path = require('path')


if (argv._[0] === 'help') {
    console.log("Usage:");
    logHelp()
    process.exit()
}
else if (argv._[0] === 'play')
{
    var port = process.env.PORT || argv.port

    console.log("------------------------------------------------------")
    console.log("Playing Konga!")
    console.log("------------------------------------------------------")
    console.log("")

    console.log(argv)

    var args = ["app.js","--prod"]
    if(port) args.push("--port=" + port)

    console.log(args)

    var cmd = spawn('node',
        args,
        {cwd : path.join(__dirname,".."), stdio: "inherit"});
    cmd.on('exit', function(code){
        console.log("Exiting",code);
    });
}
else if(argv._[0] === 'prepare') {
  var Sails = require('sails');
  Sails.lift({
    environment: 'development',
    hooks: {
      grunt: false
    }
  }, function callback(error, sails) {

    if(error) {
      console.log("Failed to lift Sails:",error)
      return process.exit(1);
    }

    process.exit()

  });
}
else
{
    console.log(argv)
    console.log("Unknown command. Try one of:");
    logHelp()
}

function logHelp() {
    console.log("==============================");
    console.log("konga play      | Start Konga.");
    console.log("==============================");
    process.exit()
}