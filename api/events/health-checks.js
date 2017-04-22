/**
 * Created by pang on 22/4/2017.
 */

var events = require('events');
var eventEmitter = new events.EventEmitter();
var cron = require('node-cron');
var tasks = {}
var KongService = require('../services/KongService')
var moment = require('moment')
var nodemailer = require('nodemailer');
var notificationsInterval = 2;

module.exports = {
    emit : function(event,data) {
        eventEmitter.emit(event,data)
    },

    addListener : function(event,fn) {
        eventEmitter.addListener(event, fn);
    },

    start : function(node) {

        sails.log('Start scheduled health checks for node ' + node.id);
        var self = this;

        if(!tasks[node.id]) {
            tasks[node.id] = {
                cron : self.createCron(node)
            }
        }

        tasks[node.id].lastSucceeded = new Date(); // Start with a success no matter what
        tasks[node.id].cron.start()
    },

    stop : function(node) {
        if(tasks[node.id]) {
            sails.log('Stopping health check for node ' + node.id);
            tasks[node.id].cron.stop()
            delete tasks[node.id]
        }
    },

    getMinutesDiff : function(start,end) {
        var duration = moment.duration(moment(start).diff(moment(end)));
        return duration.asMinutes();
    },

    createCron : function(node) {

        var self = this;
        return cron.schedule('* * * * *', function() {
            sails.log('Performing health check for node ' + node.id);
            KongService.nodeStatus(node,function(err,data){

                tasks[node.id].lastChecked = new Date();

                if(err) {
                    tasks[node.id].lastFailed = new Date();
                    tasks[node.id].timesFailed = tasks[node.id].timesFailed ? tasks[node.id].timesFailed++ : 1;
                    sails.log('Health check for node ' + node.id + ' failed',err);

                    if(self.getMinutesDiff(tasks[node.id].lastFailed,tasks[node.id].lastSucceeded) > notificationsInterval) {

                        sails.log("Last notified diff=> " + self.getMinutesDiff(new Date(),tasks[node.id].lastNotified))
                        if(!tasks[node.id].lastNotified || self.getMinutesDiff(new Date(),tasks[node.id].lastNotified) > notificationsInterval) {
                            sails.log('###################################################');
                            self.notify(node)
                        }
                    }
                }else{
                    sails.log('Health check for node ' + node.id + ' succeeded',data);
                    tasks[node.id].timesFailed = 0;
                    tasks[node.id].lastSucceeded = new Date();
                }
            })
        })
    },

    notify : function(node) {

        var self = this

        var transporter = nodemailer.createTransport({
            host : '109.123.110.249',
            port : 25,
            auth: {
                user: 'imeweb@ime.net.gr',
                pass: '1m3w!@#'
            }
        });

        var duration = tasks[node.id].timesFailed * notificationsInterval
        var html = '<h3>A Kong Node is down or unresponsive for more than ' + duration + ' minutes</h3>' +
            '<table>' +
            '<tr>' +
            '<th>Id</th>' +
            '<td>' + node.id + '</td>' +
            '</tr>' +
            '<tr>' +
            '<th>Name</th>' +
            '<td>' + node.name + '</td>' +
            '</tr>' +
            '<tr>' +
            '<th>Kong Admin URL</th>' +
            '<td>' + node.kong_admin_url + '</td>' +
            '</tr>' +
            '</table>';

        var mailOptions = {
            from: '"Konga" <noreply@konga.io>', // sender address
            to: ['tselentispanagis@gmail.com'], // list of receivers
            subject: 'A node is down or unresponsive', // Subject line
            html: html
        };

        // send mail with defined transport object
        transporter.sendMail(mailOptions, function(error, info){
            if(error){
                sails.log.error("Health_checks:notify:error",error)

            }else{
                sails.log.info("Health_checks:notify:success",info)
                tasks[node.id].lastNotified = new Date();

            }
        });
    }
}
