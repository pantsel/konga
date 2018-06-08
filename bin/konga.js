#!/usr/bin/env node bin
var argv = require('minimist')(process.argv.slice(2));
var child_process = require('child_process');
var spawn = child_process.spawn
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

  if(!process.env.DB_ADAPTER && !argv.adapter) {
    console.error("No db adapter defined. Set --adapter {mongo || mysql || postgres || sql-srv}")
    return process.exit(1);
  }

  if(!process.env.DB_URI && !argv.uri) {
    console.error("No db connection string is defined. Set --uri {db_connection_string}")
    return process.exit(1);
  }

  process.env.DB_ADAPTER = process.env.DB_ADAPTER || argv.adapter;
  process.env.DB_URI = process.env.DB_URI || argv.uri;

  var Sails = require('sails');
  Sails.lift({
    environment: 'development',
    port: process.env.PORT || argv.port || "1339",
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