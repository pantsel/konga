'use strict';

module.exports = function deleteUser(request, response, next) {
  sails.log.verbose(__filename + ':' + __line + ' [Policy.deleteUser() called]');


  const userId = request.param('id');
  const myId = request.token;

  // Cannot delete own account
  if(userId == myId) {
    sails.log.debug("Cannot delete own account");
    let error = new Error();
    error.message = 'Cannot delete own account';
    error.status = 401;

    return next(error);
  }

  return next();
};
