'use strict';

var unirest = require('unirest')

var KongaApiController = {

  getConsumerCredentials : function(req,res) {
    unirest.get(sails.config.kong_admin_url + '/consumers/' + req.params.id + '/' + req.params.credential)
        .end(function (response) {
          if (response.error)  return res.kongError(response)
          return res.json(response.body.data)
        })
  }
};

module.exports = KongaApiController;
