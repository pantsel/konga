#!/usr/bin/env node bin
require('dotenv').config()
var argv = require('minimist')(process.argv.slice(2));
var child_process = require('child_process');
var spawn = child_process.spawn
var path = require('path')
var _ = require('lodash');
var Sails = require('sails');


if (argv._[0] === 'help') {
    console.log("Usage:");
    logHelp()
    process.exit()
}
else if (argv._[0] === 'play')
{
    var port = process.env.PORT || argv.port
    var host = process.env.HOST || argv.host

    console.log("------------------------------------------------------")
    console.log("Playing Konga!")
    console.log("------------------------------------------------------")
    console.log("")

    console.log(argv)

    var args = ["app.js","--prod"]
    if(port) args.push("--port=" + port)
    if(host) args.push("--host=" + host)

    console.log(args)

    var cmd = spawn('node',
        args,
        {cwd : path.join(__dirname,".."), stdio: "inherit"});
    cmd.on('exit', function(code){
        console.log("Exiting",code);
    });
}
else if(argv._[0] === 'prepare') {

  // Validate node version
  const Utils = require('../api/services/Utils');
  if(!Utils.isRuntimeVersionSupported()) {
    console.error("Incompatible Node.js version. Please make sure that you have Node.js >= 8 installed.")
    process.exit(1);
  }

  Sails.log("Preparing database...")

  if(!process.env.DB_ADAPTER && !argv.adapter) {
    Sails.log.error("No db adapter defined. Set --adapter {mongo || mysql || postgres || sql-srv}")
    return process.exit(1);
  }

  if(!process.env.DB_URI && !argv.uri) {
    Sails.log.error("No db connection string is defined. Set --uri {db_connection_string}")
    return process.exit(1);
  }

  process.env.DB_ADAPTER = process.env.DB_ADAPTER || argv.adapter;
  process.env.DB_URI = process.env.DB_URI || argv.uri;
  process.env.PORT = _.isString(argv.port) || _.isNumber(argv.port) ? argv.port : 1339;

  require("../makedb")(function(err) {
    if(err) return process.exit(1);

    Sails.load({
      environment: 'development',
      port: process.env.PORT,
      hooks: {
        grunt: false
      }
    }, function callback(error, sails) {

      if(error) {
        Sails.log.error("Failed to prepare database:",error)
        return process.exit(1);
      }

      sails.log("Database migrations completed!")
      process.exit()

    });
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
