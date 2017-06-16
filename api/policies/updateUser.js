'use strict';

/**
 * Policy to set necessary create data to body.
 *
 * @param   {Request}   request     Request object
 * @param   {Response}  response    Response object
 * @param   {Function}  next        Callback function
 */
module.exports = function updateUser(request, response, next) {
    sails.log.verbose(__filename + ':' + __line + ' [Policy.updateUser() called]');

    var password = request.body.passports ? request.body.passports.password : null
    var confirmation = request.body.password_confirmation

    if (password && password != "") {
        if (password != confirmation) {
            var error = new Error();

            error.Errors = {
                password_confirmation: [
                    {
                        message: 'Password and password confirmation don\'t match'
                    }
                ]
            }
            error.status = 400;

            next(error);
        } else {
            next();
        }
    } else {
        if (!password) delete request.body.passports; // We don't need passports for update if password is not set
        next();
    }

};
