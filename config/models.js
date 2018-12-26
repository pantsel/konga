'use strict';

var _ = require("lodash");
var async = require("async");

/**
 * Default model configuration
 * (sails.config.models)
 *
 * Unless you override them, the following properties will be included
 * in each of your models.
 *
 * For more info on Sails models, see:
 * http://sailsjs.org/#/documentation/concepts/ORM
 */
module.exports.models = {
    /***************************************************************************
     *                                                                          *
     * Your app's default connection. i.e. the name of one of your app's        *
     * connections (see `config/connections.js`)                                *
     *                                                                          *
     ***************************************************************************/
    connection: process.env.DB_ADAPTER || 'localDiskDb',
    migrate: 'alter',

    updateOrCreate: function(criteria, values, cb){
        var self = this; // reference for use by callbacks
        // If no values were specified, use criteria
        if (!values) values = criteria.where ? criteria.where : criteria;

        this.findOne(criteria, function (err, result){
            if(err) return cb(err, false);

            if(result){
                self.update(criteria, values, cb);
            }else{
                self.create(values, cb);
            }
        });
    },

    /**
     * This method adds records to the database
     *
     * To use add a variable 'seedData' in your model and call the
     * method in the bootstrap.js file
     */
    seed: function (callback) {
        var self = this;
        var modelName = self.adapter.identity.charAt(0).toUpperCase() + self.adapter.identity.slice(1);
        if (!self.seedData) {
            sails.log.debug('No data available to seed ' + modelName);
            callback();
            return;
        }
        self.count().exec(function (err, count) {

            if(err) {
                sails.log.error("Failed to seed " + modelName, err);
                return callback();
            }

            if(count === 0) {
                sails.log.debug('Seeding ' + modelName + '...');
                if (self.seedData instanceof Array) {
                    self.seedArray(callback);
                } else {
                    self.seedObject(callback);
                }
            }else{
                if(modelName === 'Emailtransport') {
                    // Update records
                    self.updateRecords(callback);
                }else{
                    sails.log.debug(modelName + ' had models, so no seed needed');
                    return callback();
                }
            }
        });
    },

    updateRecords : function (callback) {
        var self = this;
        var modelName = self.adapter.identity.charAt(0).toUpperCase() + self.adapter.identity.slice(1);
        self.find({}).exec(function (err, results) {
            if (err) {
                sails.log.debug(err);
                callback();
            } else {



                var data = [];

                self.seedData.forEach(function (seed) {

                    const updateItem = _.find(results, (item) => {
                        return item.name === seed.name;
                    })

                    if(updateItem) data.push(_.merge(seed, updateItem));
                })

                var fns = [];

                data.forEach(function (item) {
                    fns.push(function(cb){
                        self.update({
                            id :item.id
                        },_.omit(item, ["id"])).exec(cb)
                    })
                })

                async.series(fns,function (err,data) {
                    if (err) {
                        sails.log.debug(err);
                        callback();
                    }else{
                        sails.log.debug(modelName + ' seeds updated');
                        callback();
                    }
                })
            }
        });
    },

    seedArray: function (callback) {
        var self = this;
        var modelName = self.adapter.identity.charAt(0).toUpperCase() + self.adapter.identity.slice(1);
        self.createEach(self.seedData).exec(function (err, results) {
            if (err) {
                sails.log.debug(err);
                callback();
            } else {
                sails.log.debug(modelName + ' seed planted');
                callback();
            }
        });
    },
    seedObject: function (callback) {
        var self = this;
        var modelName = self.adapter.identity.charAt(0).toUpperCase() + self.adapter.identity.slice(1);
        self.create(self.seedData).exec(function (err, results) {
            if (err) {
                sails.log.debug(err);
                callback();
            } else {
                sails.log.debug(modelName + ' seed planted');
                callback();
            }
        });
    }
};
