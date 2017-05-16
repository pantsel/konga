'use strict';


module.exports = function signup(request, response, next) {
  sails.log.verbose(__filename + ':' + __line + ' [Policy.signup() called]');

  sails.models.settings.find().limit(1)
      .exec(function(err,data){
        if(err) return next(err)
        if(!data || !data[0] || !data[0].signup_enable) return response.forbidden()
        return next()
      })
};
