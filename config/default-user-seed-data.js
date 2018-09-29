/**
 * Created by rmetcalf9 on 5/2/2018.
 */
'use strict';
var fs = require('fs');

/*
 Return the seed data to be used, either from a file or hardcoded depending
 on enviroment variable setting
*/
function getseedData() {
  var readEnvVar = process.env.KONGA_SEED_USER_DATA_SOURCE_FILE;
  if (typeof(readEnvVar) == 'undefined') {
    readEnvVar = undefined;
  } else {
    readEnvVar = readEnvVar.trim();
    if (readEnvVar.length == 0) {
      readEnvVar = undefined;
    } else {
      if (!fs.existsSync(readEnvVar)) {
        console.log('Could not find KONGA_SEED_USER_DATA_SOURCE_FILE');
        readEnvVar = undefined;
      }
      try {
        var seedUserData = require(readEnvVar);
        if (typeof(seedUserData) != 'object') {
          readEnvVar = undefined;
        } else {
          // We may place other checks on file contents here if required
          console.log('Sucessfully read in user seed data file');
        }
      } catch (e) {
        console.log(e);
        console.log('Failed to load KONGA_SEED_USER_DATA_SOURCE_FILE');
        console.log('Reverting to default user seed');
        readEnvVar = undefined;
      }
    }
  }
  if(typeof(readEnvVar) == 'undefined') {
    return [];
  };
  return seedUserData
}

module.exports = {
    seedData: getseedData()
}

