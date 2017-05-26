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
else if (argv._[0] === 'create')
{

    var items = ["apis","consumers"]
    var size = 500;

    if(items.indexOf(argv._[1]) < 0) {
        console.log("Invalid parameter. Try one of : " + items.join(","))
        return false
    }

    // 3rd arg must be an integer
    if(argv._[2] && !isInt(argv._[2])) {
        console.log("The 3rd paramater must be an integer.")
        return false
    }

    var Sails = require('sails');
    var fs = require('fs')



    fs.unlink('.tmp/localDiskDb.db', function unlinkDone(error) {
        Sails.lift({
            // configuration for testing purposes
            models: {
                connection: 'localDiskDb',
                migrate: 'drop'
            },
            port: 1336,
            environment: 'test',
            log: {
                level: 'error'
            },
            hooks: {
                grunt: false
            }
        }, function callback(error, sails) {

            if(error) {
                console.log("Failed to lift Sails:",error)
                return false;
            }

            console.log("Creating dummy data")

            sails.config.kong_admin_url = "http://192.168.99.100:8001"

            size = argv._[2] || size

            var fns = [];
            var KongService = require('../api/services/KongService')
            var uuid = require('node-uuid');
            var async = require('async')

            for(var i = 0; i < size; i++) {

                fns.push(function(callback){

                    var data = argv._[1] == 'apis' ? {
                        name : uuid.v4(),
                        uris : "/" + uuid.v4(),
                        upstream_url : "https://mockbin.com"

                    } : {
                        username : uuid.v4(),
                        custom_id : uuid.v4(),
                    }

                    KongService.createFromEndpointCb('/' + argv._[1],data,{},callback);

                })

            }


            async.series(fns,function(err,data){
                if(err) console.log(err.body)
                console.log("Created " + size + " dummy " + argv._[1])
                sails.lower();
            })

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

function isInt(value) {
    if (isNaN(value)) {
        return false;
    }
    var x = parseFloat(value);
    return (x | 0) === x;
}