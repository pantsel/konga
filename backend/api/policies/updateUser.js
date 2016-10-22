'use strict';

/**
 * Policy to set necessary create data to body.
 *
 * @param   {Request}   request     Request object
 * @param   {Response}  response    Response object
 * @param   {Function}  next        Callback function
 */
module.exports = function addDataCreate(request, response, next) {
  sails.log.verbose(__filename + ':' + __line + ' [Policy.updateUser() called]');
  console.log('[Policy.updateUser()] -> body : ',request.body);

  var password = request.body.passports ? request.body.passports.password : null
  var confirmation = request.body.password_confirmation

  console.log('[Policy.updateUser()] -> password : ' + password);
  console.log('[Policy.updateUser()] -> confirmation : ' + confirmation);

  if(password && password != "") {
    if(password != confirmation) {
      var error = new Error();

      error.invalidAttributes = {
        "password_confirmation" : [{
          message : 'Password and password confirmation don\'t match.'
        }]
      }
      error.status = 400;

      next(error);
    }else{
      next();
    }
  }else{
    next();
  }

};
