#!/bin/bash

#bash start.sh -c prepare -a postgres -u postgresql://postgres:postgres@localhost:5432/konga

if [ $# -eq 0 ]
  then
    # If no args are set, start the app as usual
    node --harmony app.js
  else
    while getopts c:a:u:p option
    do
        case "${option}"
            in
            c) COMMAND=${OPTARG};;
            a) ADAPTER=${OPTARG};;
            u) URI=${OPTARG};;
            p) PORT=${OPTARG};;
        esac
    done

#    echo $COMMAND
#    echo $ADAPTER
#    echo $URI

    if [ "$COMMAND" == "prepare" ]
        then
            node ./bin/konga.js $COMMAND --adapter $ADAPTER --uri $URI --port $PORT
        else
            echo "Invalid command: $COMMAND"
            exit
    fi
fi




