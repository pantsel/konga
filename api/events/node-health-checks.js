/**
 * Created by pang on 22/4/2017.
 */

var events = require('events');
var _ = require('lodash')
var eventEmitter = new events.EventEmitter();
var cron = require('node-cron');
var path = require('path')
var tasks = {}
var KongService = require('../services/KongService')
var moment = require('moment')
var nodemailer = require('nodemailer');
var mg = require('nodemailer-mailgun-transport');
var notificationsInterval = 30;
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

    start : function(node) {

        if(tasks[node.id] &&  tasks[node.id].isStarted) return false;

        sails.log('Start scheduled health checks for node ' + node.id);
        var self = this;

        sails.models.kongnode.findOne({
            id:node.id
        }).exec(function(err,node){
            if(!err && node) {

                if(node.health_check_details) {
                    tasks[node.id] = node.health_check_details
                    tasks[node.id].cron = self.createCron(node)
                }else{
                    tasks[node.id] = {
                        cron : self.createCron(node)
                    }
                }
                tasks[node.id].timesFailed = 0;
                tasks[node.id].cron.start()
                tasks[node.id].isStarted = true;
            }
        })
    },

    stop : function(node) {
        if(tasks[node.id]) {
            sails.log('Stopping health check for node ' + node.id);
            tasks[node.id].cron.stop()
            tasks[node.id].isStarted = false;
            //delete tasks[node.id]
        }
    },

    createCron : function(node) {

        var self = this;
        return cron.schedule('* * * * *', function() {
            sails.log('Performing health check for node ' + node.id);
            KongService.nodeStatus(node,function(err,data){

                tasks[node.id].lastChecked = new Date();

                if(err) {
                    if(!tasks[node.id].firstFailed) tasks[node.id].firstFailed = new Date();
                    tasks[node.id].firstSucceeded = null;
                    tasks[node.id].lastFailed = new Date();
                    tasks[node.id].lastFailedReason = 'The node is down or unresponsive';
                    tasks[node.id].isHealthy = false;
                    tasks[node.id].timesFailed++;
                    sails.log('health_checks:cron:checkStatus => Health check for node ' + node.id + ' failed ' + tasks[node.id].timesFailed + ' times');

                    var timeDiff = Utils.getMinutesDiff(new Date(),tasks[node.id].lastNotified)
                    sails.log('health_checks:cron:checkStatus:last notified => ' + tasks[node.id].lastNotified);
                    sails.log('health_checks:cron:checkStatus => Checking if eligible for notification',timeDiff);
                    if(!tasks[node.id].lastNotified || timeDiff > notificationsInterval) {
                        self.notify(node)
                    }

                }else{
                    sails.log('Health check for node ' + node.id + ' succeeded',data);

                    // The node may be up and running, but we also need to check
                    // if the database is reachable.
                    // If the database is not reachable, the check will have to be marked as failed.
                    if(!_.get(data,'database.reachable')) {
                        if(!tasks[node.id].firstFailed) tasks[node.id].firstFailed = new Date();
                        tasks[node.id].firstSucceeded = null;
                        tasks[node.id].lastFailed = new Date();
                        tasks[node.id].lastFailedReason = 'Database is unreachable';
                        tasks[node.id].isHealthy = false;
                        tasks[node.id].timesFailed++;
                        sails.log('health_checks:cron:checkStatus => Health check for node ' + node.id + ' failed ' + tasks[node.id].timesFailed + ' times.' +
                          'Database is unreachable');

                        var timeDiff = Utils.getMinutesDiff(new Date(),tasks[node.id].lastNotified)
                        sails.log('health_checks:cron:checkStatus:last notified => ' + tasks[node.id].lastNotified);
                        sails.log('health_checks:cron:checkStatus => Checking if eligible for notification',timeDiff);
                        if(!tasks[node.id].lastNotified || timeDiff > notificationsInterval) {
                            self.notify(node);
                        }
                    } else {
                        if(!tasks[node.id].firstSucceeded) tasks[node.id].firstSucceeded = new Date();
                        tasks[node.id].timesFailed = 0;
                        tasks[node.id].isHealthy = true;
                        tasks[node.id].firstFailed = null;
                        tasks[node.id].lastSucceeded = new Date();
                    }

                }

                self.updateNodeHealthCheckDetails(node.id)
            })
        })
    },

    updateNodeHealthCheckDetails : function(nodeId) {

        var data = _.cloneDeep(tasks[nodeId])
        delete(data.cron)

        sails.models.kongnode.update({id: nodeId},{
            health_check_details : data
        }).exec(function(err,updated){
            // Fire and forger for now
            if(err) {
                sails.log("health_checks:updateNodeHealthCheckDetails:failed",err)
            }else{
                sails.sockets.blast('node.health_checks', _.merge({node_id:nodeId},data));
            }
        })
    },

    createTransporter : function(settings,cb) {

        // Get active transport
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
                    result.transporter = nodemailer.createTransport(transport.settings)
                    break;
                case "mailgun":
                    result.transporter = nodemailer.createTransport(mg(transport.settings))
                    break;
            }

            return cb(null,result);

        })

    },

    notify : function(node) {

        var self = this

        sails.models.settings.find().limit(1)
            .exec(function(err,settings) {
                if (err) return cb(err)
                sails.log("helath_checks:settings =>", settings)
                if (!settings.length
                    || !settings[0].data
                    || !settings[0].data.notify_when.node_down.active) return false;


                Utils.sendSlackNotification(settings[0],self.makePlainTextNotification(node));

                self.createTransporter(settings[0],function(err,result){
                    if(err || !result) {
                        sails.log("health_check:failed to create transporter. No notification will be sent.",err)
                    }else{
                        var transporter = result.transporter
                        var html = self.makeHTMLNotification(node)
                        var settings = result.settings

                        Utils.getAdminEmailList(function(err,receivers){
                            sails.log("health_checks:notify:receivers => ",  receivers)
                            if(!err && receivers.length) {

                                var mailOptions = {
                                    from: '"' + settings.email_default_sender_name + '" <' + settings.email_default_sender + '>', // sender address
                                    to: receivers.join(","), // list of receivers
                                    subject: 'A node is down or unresponsive', // Subject line
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

                tasks[node.id].lastNotified = new Date();
                self.updateNodeHealthCheckDetails(node.id)

            });


    },

    makePlainTextNotification : function makePlainTextNotification(node) {

        var duration = moment.duration(moment().diff(moment(tasks[node.id].lastSucceeded))).humanize()

        var text = '[ ' + moment().format('MM/DD/YYYY @HH:mm:ss') + ' ] A Kong Node  health check is failing for more than '
            + duration + '. ID: ' + node.id + ' | Name: ' + node.name + " | Kong Admin URL: " + node.kong_admin_url + ' | ' +
          ' Reason: ' + _.get(tasks, `${node.id}.lastFailedReason`, 'N/A') + '.';

        return text;
    },

    makeHTMLNotification : function makeHTMLNotification(node) {

        var duration = moment.duration(moment().diff(moment(tasks[node.id].lastSucceeded))).humanize()

        var html = '<h3>A Kong Node health check is failing for more than ' + duration + '</h3>' +
          '<h4>' + _.get(tasks, `${node.id}.lastFailedReason`, 'N/A') + '</h4>' +
            '<table style="border: 1px solid #ccc;background-color: #eaeaea">' +
            '<tr>' +
            '<th style="text-align: left">Id</th>' +
            '<td style="text-align: left">' + node.id + '</td>' +
            '</tr>' +
            '<tr>' +
            '<th style="text-align: left">Name</th>' +
            '<td style="text-align: left">' + node.name + '</td>' +
            '</tr>' +
            '<tr>' +
            '<th style="text-align: left">Kong Admin URL</th>' +
            '<td style="text-align: left">' + node.kong_admin_url + '</td>' +
            '</tr>' +
            '</table>';

        return html;
    }
}
