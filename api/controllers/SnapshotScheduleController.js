var _ = require('lodash');
var cron = require('node-cron');

module.exports = _.merge(_.cloneDeep(require('../base/Controller')), {



    create : function (req,res) {


        // Validate cron
        if(!cron.validate(req.body.cron)) {
            return res.badRequest({
                message : "Cron parameters are not valid",
                fields : ["cron"]
            });
        }


        SnapshotSchedule.create(req.body)
            .exec(function (err,created) {
                if(err) {
                    return res.negotiate(err);
                }

                return res.json(created);
            });


    }
});
