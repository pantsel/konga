'use strict';




var ApiHealthCheckService = {



    updateCb: function (criteria, data,cb) {
        sails.models.apihealthcheck.update(criteria,data).exec(function(err,updated){
            if(err){
                return cb(err)
            }

            return cb(null,updated)
        })
    },



    deleteCb: function (criteria,cb) {
        sails.models.apihealthcheck.destroy(criteria).exec(function(err,deleted){
            if(err){
                return cb(err)
            }

            return cb(null,deleted)
        })
    }
}

module.exports = ApiHealthCheckService
