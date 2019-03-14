/**
 * Created by rmetcalf9 on 5/2/2018.
 */
'use strict';
var fs = require('fs');

/*
 Return the seed data to be used, either from a file or hardcoded depending
 on enviroment variable setting
*/
function getseedData(env_var_name, model_name) {
  var readEnvVar = process.env[env_var_name];
  if (typeof (readEnvVar) == 'undefined') {
    readEnvVar = undefined;
  } else {
    readEnvVar = readEnvVar.trim();
    if (readEnvVar.length == 0) {
      readEnvVar = undefined;
    } else {
      if (!fs.existsSync(readEnvVar)) {
        console.log('Could not find ' + readEnvVar + ' from ' + env_var_name);
        readEnvVar = undefined;
      }
      try {
        var seedUserData = require(readEnvVar);
        if (typeof (seedUserData) != 'object') {
          readEnvVar = undefined;
        } else {
          // We may place other checks on file contents here if required
          console.log('Sucessfully read in ' + model_name + ' seed data file');
        }
      } catch (e) {
        console.log(e);
        console.log('Failed to load ' + readEnvVar + ' from ' + env_var_name);
        console.log('Reverting to default ' + model_name + ' seed');
        readEnvVar = undefined;
      }
    }
  }
  if (typeof (readEnvVar) == 'undefined') {
    return [];
  };

  return seedUserData
}

module.exports = {
  userSeedData: getseedData('KONGA_SEED_USER_DATA_SOURCE_FILE', 'user'),
  kongNodeSeedData: getseedData('KONGA_SEED_KONG_NODE_DATA_SOURCE_FILE', 'kong_node')
}