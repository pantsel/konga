"use strict";

/**
 * Policy to set necessary create data to body.
 *
 * @param   {Request}   request     Request object
 * @param   {Response}  response    Response object
 * @param   {Function}  next        Callback function
 */
module.exports = function updateUser(request, response, next) {
  sails.log.verbose(
    __filename + ":" + __line + " [Policy.updateUser() called]"
  );

  var password = request.body.passports
    ? request.body.passports.password
    : null;
  var confirmation = request.body.password_confirmation;

  if (password && password != "") {
    if (password != confirmation) {
      var error = new Error();

      error.Errors = {
        password_confirmation: [
          {
            message: "Password and password confirmation don't match",
          },
        ],
      };
      error.status = 400;

      next(error);
    } else {
      next();
    }
  } else {
    if (!password) delete request.body.passports; // We don't need passports for update if password is not set

    // Fix: Priviledged user escalation
    // If requestor is not an admin, the `admin` property should not be sent to the cotroller
    // in order to prevent and non admin user to escalate to administrator status.
    // Fetch current user by the token
    sails.models["user"]
      .findOne(request.token)
      .exec(function exec(error, user) {
        if (error) {
          next(error);
        } else if (!user) {
          error = new Error();

          error.status = 401;
          error.message = "User not found - Please login.";

          next(error);
        } else if (user.admin) {
          next();
        } else {
            // Remove the `admin` property from the request body so it cannot be tampered
            delete request.body.admin
          next();
        }
      });
  }
};
