/**
 * Created by pang on 22/4/2017.
 */

const events = require('events');
const _ = require('lodash');
const eventEmitter = new events.EventEmitter();
const unirest = require('unirest')
const cron = require('node-cron');
const moment = require('moment')
const hcmailer = require('nodemailer');
const mg = require('nodemailer-mailgun-transport');
const notificationsInterval = 15;
const KongService = require('../services/KongService');
const sendmail = require('sendmail')({
    logger: {
        debug: sails.log,
        info: console.info,
        warn: console.warn,
        error: console.error
    },
    silent: false
})
const Utils = require("../helpers/utils");

let tasks = {};


module.exports = {
    emit : function(event,data) {
        eventEmitter.emit(event,data)
    },

    addListener : function(event,fn) {
        eventEmitter.addListener(event, fn);
    },

    start : function(hc) {

        if(!hc.id) return false;

        if(tasks[hc.id]) { // Reset task if exists
            sails.log('Resetting health check for hc ' + hc.id);
            tasks[hc.id].cron.stop();
            delete tasks[hc.id];
        }

        sails.log('Start scheduled health checks for upstream ', hc.id);
        var self = this;

        tasks[hc.id] = _.merge(hc, {
            cron: self.createCron(hc)
        });

        tasks[hc.id].cron.start();
    },

    stop : function(hc) {
        if(tasks[hc.id]) {
            sails.log('Stopping health check for hc ' + hc.id);
            tasks[hc.id].cron.stop();
            delete tasks[hc.id];
        }
    },

    createCron : function(hc) {

        var self = this;
        return cron.schedule('* * * * *', async () => {
            sails.log('Checking health of upstream => ', hc);

            try {

                // Fetch the upstreamalert again in case it has changed
                // while the cron is running
                hc = await sails.models.upstreamalert.findOne({
                    id: hc.id
                });

                // Get the Kong connection the upstream belongs to
                const connection = await sails.models.kongnode.findOne({
                    id: hc.connection.id || hc.connection
                })
                if(!connection) return sails.log("Upstream health => No connection set. Ending it.");

                sails.log("Kong Connection =>", connection);
                const targetsHC = await KongService.get({
                    connection: connection
                }, `/upstreams/${hc.upstream_id}/health`);

                sails.log("Upstream targetsHC", targetsHC);

                if(!targetsHC.data || !targetsHC.data.length) return false;

                // Check results recursively for 'UNHEALTHY' | 'DNS_ERROR' health
                let unhealthyTargets = _.filter(targetsHC.data, (item) => {
                    return item.health === 'UNHEALTHY' || item.health === 'DNS_ERROR'
                });

                sails.log("Unhealthy upstream targets", unhealthyTargets);
                if(unhealthyTargets.length) {
                    self.notify(hc, connection, unhealthyTargets);
                }


            }catch (e) {
                sails.log("Upstream health => Failed to retrieve connection",e);
            }

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
                sails.log("Upstream health:updatehcHealthCheckDetails:failed",err)
            }else{
                sails.sockets.blast('api.Upstream health', _.merge({hc_id:hcId},data));
            }
        })
    },

    createTransporter : function(settings,cb) {

        sails.log("Upstream health:createTransporter => trying to get transport",{
            "notifications_enabled" : settings.data.email_notifications,
            "transport_name" : settings.data.default_transport
        })
        sails.models.emailtransport.findOne({
            name : settings.data.default_transport
        }).exec(function(err,transport){
            if(err) return cb(err)

            sails.log("Upstream health:createTransporter:transport =>",transport)
            if(!transport) return cb()

            var result = {
                settings : settings.data,
            }

            switch(settings.data.default_transport) {
                case "smtp":
                    result.transporter = hcmailer.createTransport(transport.settings)
                    break;
                case "mailgun":
                    sails.log("Upstream health:createTransporter:transport is mailgun");
                    sails.log(`[api_key]=>`, _.get(transport,'settings.auth.api_key'));
                    sails.log(`[domain]=>`, _.get(transport,'settings.auth.domain'));
                    if(!_.get(transport,'settings.auth.api_key') || !_.get(transport,'settings.auth.domain')) {
                        result.transporter = null;
                    }else{
                        result.transporter = hcmailer.createTransport(mg(transport.settings))
                    }
                    break;
            }

            return cb(null,result);

        })

    },

    notify : function(hc, connection, unhealthyTargets) {

        var self = this

        if(!hc.email && !hc.slack) {
            return sails.log("Slack and email notifications are disabled for this Upstream.");
        }

        sails.models.settings.find().limit(1)
          .exec(function(err,settings) {
              if (err) return sails.log(`Failed to get settings`, err);
              console.log('UpstreamHC:notify:settings =>', JSON.stringify(settings));
              if (!settings.length || !settings[0].data) return false;

              if(hc.slack) {
                  Utils.sendSlackNotification(settings[0],self.makePlainTextNotification(connection, unhealthyTargets));
              }else{
                  sails.log("Slack notifications are disabled for this Upstream.")
              }

              if(hc.email) {
                  self.createTransporter(settings[0], function (err, result) {
                      if (err || !result || !result.transporter) {
                          sails.log("health_check:failed to create transporter. No notification will be sent.", err)
                      } else {
                          var transporter = result.transporter
                          var settings = result.settings
                          var html = self.makeHTMLNotification(connection, unhealthyTargets)

                          Utils.getAdminEmailList(function (err, receivers) {
                              sails.log("Upstream health:notify:receivers => ", receivers)
                              if (!err && receivers.length) {

                                  var mailOptions = {
                                      from: '"' + settings.email_default_sender_name + '" <' + settings.email_default_sender + '>', // sender address
                                      to: receivers.join(","), // list of receivers
                                      subject: 'An alert was triggered (Upstream Health)', // Subject line
                                      html: html
                                  };

                                  if (settings.default_transport == 'sendmail') {
                                      sendmail(mailOptions, function (err, reply) {
                                          if (err) {
                                              sails.log.error("Upstream health:notify:error", err)
                                          } else {
                                              sails.log.info("Upstream health:notify:success", reply)

                                          }
                                      });
                                  } else {
                                      transporter.sendMail(mailOptions, function (error, info) {
                                          if (error) {
                                              sails.log.error("Upstream health:notify:error", error)

                                          } else {
                                              sails.log.info("Upstream health:notify:success", info)

                                          }
                                      });
                                  }
                              }
                          })
                      }
                  })
              }
          })

        // sails.models.settings.find().limit(1)
        //     .exec(function(err,settings) {
        //         if (err) return cb(err)
        //         sails.log("helath_checks:settings =>", settings)
        //         if (!settings.length
        //             || !settings[0].data
        //             || !settings[0].data.notify_when.api_down.active) return false;
        //
        //
        //         Utils.sendSlackNotification(settings[0],self.makePlainTextNotification(hc));
        //
        //         self.notifyNotificationEndpoint(hc)
        //
        //         self.createTransporter(settings[0],function(err,result){
        //             if(err || !result) {
        //                 sails.log("health_check:failed to create transporter. No notification will be sent.",err)
        //             }else{
        //                 var transporter = result.transporter
        //                 var settings = result.settings
        //                 var html = self.makeHTMLNotification(hc)
        //
        //                 Utils.getAdminEmailList(function(err,receivers){
        //                     sails.log("Upstream health:notify:receivers => ",  receivers)
        //                     if(!err && receivers.length) {
        //
        //                         var mailOptions = {
        //                             from: '"' + settings.email_default_sender_name + '" <' + settings.email_default_sender + '>', // sender address
        //                             to: receivers.join(","), // list of receivers
        //                             subject: 'An API is down or unresponsive', // Subject line
        //                             html: html
        //                         };
        //
        //                         if(settings.default_transport == 'sendmail') {
        //                             sendmail(mailOptions, function(err, reply) {
        //                                 if(err){
        //                                     sails.log.error("Upstream health:notify:error",err)
        //                                 }else{
        //                                     sails.log.info("Upstream health:notify:success",reply)
        //
        //                                 }
        //                             });
        //                         }else{
        //                             transporter.sendMail(mailOptions, function(error, info){
        //                                 if(error){
        //                                     sails.log.error("Upstream health:notify:error",error)
        //
        //                                 }else{
        //                                     sails.log.info("Upstream health:notify:success",info)
        //
        //                                 }
        //                             });
        //                         }
        //                     }
        //                 })
        //             }
        //         })
        //
        //         tasks[hc.id].lastNotified = new Date();
        //         self.updatehcHealthCheckDetails(hc.id)
        //
        //
        //     });


    },

    notifyNotificationEndpoint : function(hc) {

        sails.log("api_Upstream health:notifyNotificationEndpoint")
        if(!hc.notification_endpoint) {
            sails.log("api_Upstream health:notifyNotificationEndpoint => No notification endpoint defined")
            return false;
        }

        unirest.post(hc.notification_endpoint)
            .header('Content-Type', 'application/json')
            .send(hc.api)
            .end(function (response) {
                if (response.error)  {
                    sails.log("api_Upstream health:notifyNotificationEndpoint => Failed to notify notification endpoint",response.error)
                }else{
                    sails.log("api_Upstream health:notifyNotificationEndpoint => Succeeded to notify notification endpoint")
                }

            })
    },

    makeHTMLNotification : function makeHTMLNotification(connection, unhealthyTargets) {

        let html = '<h2>Some Upstream health checks have failed</h2>' +
          '<h3>Connection</h3>' +
          '<table style="border: 1px solid #ccc;background-color: #eaeaea">' +
          '<tr>' +
          '<th style="text-align: left">Name</th>' +
          '<td style="text-align: left">' + connection.name + '</td>' +
          '</tr>' +
          '<th style="text-align: left">URL</th>' +
          '<td style="text-align: left">' + connection.kong_admin_url + '</td>' +
          '</tr>' +
          '</table>' +

          '<h3>Unhealthy Targets</h3>' +
          '<table style="border: 1px solid #ccc;background-color: #eaeaea">' +
          '<tr>' +
          '<th>Upstream Id</th>' +
          '<th>Target</th>' +
          '<th>Health</th>' +
          '</tr>';

        unhealthyTargets.forEach(target => {
           const row = '<tr>' +
             '<td>' + _.get(target, 'upstream.id', 'N/A') + '</td>' +
             '<td>' + target.target + '</td>' +
             '<td>' + target.health + '</td>' +
             '</tr>';

           html += row;
        });

        html += '</table>';

        return html;
    },

    makePlainTextNotification : function(connection, unhealthyTargets){

        var text = '[ ' + moment().format('MM/DD/YYYY @HH:mm:ss') + ' ] Some upstream health checks have failed: ';
        unhealthyTargets.forEach(target => {
            text += '```Connection: `' +
              connection.name +
              '`, Upstream id: `' +
              _.get(target, 'upstream.id', 'N/A') +
            '`, Target: `' +
              target.target +
              '`, Health: `' +
              target.health + '` ``` '
        })

        return text;
    }

}
