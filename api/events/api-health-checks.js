/**
 * Created by pang on 22/4/2017.
 */

var events = require('events');
var _ = require('lodash')
var eventEmitter = new events.EventEmitter();
var unirest = require('unirest')
var cron = require('node-cron');
var path = require('path')
var tasks = {}
var KongService = require('../services/KongService')
var moment = require('moment')
var hcmailer = require('nodemailer');
var mg = require('nodemailer-mailgun-transport');
var notificationsInterval = 15;
var sendmail = require('sendmail')({
    logger: {
        debug: sails.log,
        info: console.info,
        warn: console.warn,
        error: console.error
    },
    silent: false
})
var Utils = require("../helpers/utils");


module.exports = {
    emit : function(event,data) {
        eventEmitter.emit(event,data)
    },

    addListener : function(event,fn) {
        eventEmitter.addListener(event, fn);
    },

    start : function(hc) {

        if(( tasks[hc.id] &&  tasks[hc.id].isStarted )|| !hc.id) return false;

        sails.log('Start scheduled health checks for hc ', hc.id);
        var self = this;

        sails.models.apihealthcheck.findOne({
            id:hc.id
        }).exec(function(err,hc){
            if(!err && hc) {

                if(hc.data) {
                    tasks[hc.id] = hc.data
                    tasks[hc.id].cron = self.createCron(hc)
                }else{
                    tasks[hc.id] = {
                        cron : self.createCron(hc)
                    }
                }
                tasks[hc.id].timesFailed = 0;
                tasks[hc.id].cron.start()
                tasks[hc.id].isStarted = true;
            }
        })
    },

    stop : function(hc) {
        if(tasks[hc.id]) {
            sails.log('Stopping health check for hc ' + hc.id);
            tasks[hc.id].cron.stop()
            tasks[hc.id].isStarted = false;
            //delete tasks[hc.id]
        }
    },

    createCron : function(hc) {

        var self = this;
        return cron.schedule('* * * * *', function() {
            sails.log('Performing health check for hc ' + hc.id);

            // Get ApiHealthCheck again in case it has been changed while the cron was running
            sails.models.apihealthcheck.findOne({
                id:hc.id
            }).exec(function(err,hc){
                if(err || !hc) {

                    sails.log("api_health_checks => Failed to retrieve apiHealthCheck",err)

                }else{
                    tasks[hc.id] = _.merge(tasks[hc.id],hc.data)

                    if(!hc.health_check_endpoint) {
                        sails.log("api_health_checks =>","no health_check_endpoint defined. Ending it.")
                        return false;
                    }

                    sails.log("api_health_checks => Performing GET request to " + hc.health_check_endpoint)

                    unirest.get(hc.health_check_endpoint)
                        .end(function (response) {
                            if (response.error)  { // health check failed
                                if(!tasks[hc.id].firstFailed) tasks[hc.id].firstFailed = new Date();
                                tasks[hc.id].firstSucceeded = null;
                                tasks[hc.id].lastFailed = new Date();
                                tasks[hc.id].isHealthy = false;
                                tasks[hc.id].timesFailed++;
                                sails.log('health_checks:cron:checkStatus => Health check for hc ' + hc.id + ' failed ' + tasks[hc.id].timesFailed + ' times');

                                var timeDiff = Utils.getMinutesDiff(new Date(),tasks[hc.id].lastNotified)
                                sails.log('health_checks:cron:checkStatus:last notified => ' + tasks[hc.id].lastNotified);
                                sails.log('health_checks:cron:checkStatus => Checking if eligible for notification',timeDiff);
                                if(!tasks[hc.id].lastNotified || timeDiff > notificationsInterval) {
                                    self.notify(hc)
                                }
                            }else{ // health check succeeded
                                sails.log('Health check for hc ' + hc.id + ' succeeded');
                                if(!tasks[hc.id].firstSucceeded) tasks[hc.id].firstSucceeded = new Date();
                                tasks[hc.id].timesFailed = 0;
                                tasks[hc.id].isHealthy = true;
                                tasks[hc.id].firstFailed = null;
                                tasks[hc.id].lastSucceeded = new Date();
                            }


                            self.updatehcHealthCheckDetails(hc.id)
                        })
                }


            })

        })
    },

    updatehcHealthCheckDetails : function(hcId) {

        var data = _.cloneDeep(tasks[hcId])
        delete(data.cron)

        sails.models.apihealthcheck.update({id: hcId},{
            data : data
        }).exec(function(err,updated){
            // Fire and forger for now
            if(err) {
                sails.log("health_checks:updatehcHealthCheckDetails:failed",err)
            }else{
                sails.sockets.blast('api.health_checks', _.merge({hc_id:hcId},data));
            }
        })
    },

    createTransporter : function(settings,cb) {

        sails.log("health_checks:createTransporter => trying to get transport",{
            "notifications_enabled" : settings.data.email_notifications,
            "transport_name" : settings.data.default_transport
        })
        sails.models.emailtransport.findOne({
            name : settings.data.default_transport
        }).exec(function(err,transport){
            if(err) return cb(err)

            sails.log("health_checks:createTransporter:transport =>",transport)
            if(!transport) return cb()

            var result = {
                settings : settings.data,
            }

            switch(settings.data.default_transport) {
                case "smtp":
                    result.transporter = hcmailer.createTransport(transport.settings)
                    break;
                case "mailgun":
                    result.transporter = hcmailer.createTransport(mg(transport.settings))
                    break;
            }

            return cb(null,result);

        })

    },

    notify : function(hc) {

        var self = this


        sails.models.settings.find().limit(1)
            .exec(function(err,settings) {
                if (err) return cb(err)
                sails.log("helath_checks:settings =>", settings)
                if (!settings.length
                    || !settings[0].data
                    || !settings[0].data.notify_when.api_down.active) return false;


                Utils.sendSlackNotification(settings[0],self.makePlainTextNotification(hc));

                self.notifyNotificationEndpoint(hc)

                self.createTransporter(settings[0],function(err,result){
                    if(err || !result) {
                        sails.log("health_check:failed to create transporter. No notification will be sent.",err)
                    }else{
                        var transporter = result.transporter
                        var settings = result.settings
                        var html = self.makeHTMLNotification(hc)

                        Utils.getAdminEmailList(function(err,receivers){
                            sails.log("health_checks:notify:receivers => ",  receivers)
                            if(!err && receivers.length) {

                                var mailOptions = {
                                    from: '"' + settings.email_default_sender_name + '" <' + settings.email_default_sender + '>', // sender address
                                    to: receivers.join(","), // list of receivers
                                    subject: 'An API is down or unresponsive', // Subject line
                                    html: html
                                };

                                if(settings.default_transport == 'sendmail') {
                                    sendmail(mailOptions, function(err, reply) {
                                        if(err){
                                            sails.log.error("Health_checks:notify:error",err)
                                        }else{
                                            sails.log.info("Health_checks:notify:success",reply)

                                        }
                                    });
                                }else{
                                    transporter.sendMail(mailOptions, function(error, info){
                                        if(error){
                                            sails.log.error("Health_checks:notify:error",error)

                                        }else{
                                            sails.log.info("Health_checks:notify:success",info)

                                        }
                                    });
                                }
                            }
                        })
                    }
                })

                tasks[hc.id].lastNotified = new Date();
                self.updatehcHealthCheckDetails(hc.id)


            });


    },

    notifyNotificationEndpoint : function(hc) {

        sails.log("api_health_checks:notifyNotificationEndpoint")
        if(!hc.notification_endpoint) {
            sails.log("api_health_checks:notifyNotificationEndpoint => No notification endpoint defined")
            return false;
        }

        unirest.post(hc.notification_endpoint)
            .header('Content-Type', 'application/json')
            .send(hc.api)
            .end(function (response) {
                if (response.error)  {
                    sails.log("api_health_checks:notifyNotificationEndpoint => Failed to notify notification endpoint",response.error)
                }else{
                    sails.log("api_health_checks:notifyNotificationEndpoint => Succeeded to notify notification endpoint")
                }

            })
    },

    makeHTMLNotification : function makeHTMLNotification(hc) {

        var duration = moment.duration(moment().diff(moment(tasks[hc.id].lastSucceeded))).humanize()

        var html = '<p>An API is down or unresponsive for more than ' + duration + '</p>' +
            '<table style="border: 1px solid #ccc;background-color: #eaeaea">' +
            '<tr>' +
            '<th style="text-align: left">Id</th>' +
            '<td style="text-align: left">' + hc.id + '</td>' +
            '</tr>' +
            '<tr>' +
            '<th style="text-align: left">Name</th>' +
            '<td style="text-align: left">' + hc.api.name + '</td>' +
            '</tr>' +
            '</table>';

        return html;
    },

    makePlainTextNotification : function(hc){

        sails.log("!!!!!!!!!!!!!!!!!!!!!!",moment(tasks[hc.id].lastSucceeded));

        var duration = moment.duration(moment().diff(moment(tasks[hc.id].lastSucceeded))).humanize();

        var text = '[ ' + moment().format('MM/DD/YYYY @HH:mm:ss') + ' ] An API is down or unresponsive for more than '
            + duration + '. ID: ' + hc.id + ' | Name: ' + hc.api.name +'.';

        return text;
    }

}
