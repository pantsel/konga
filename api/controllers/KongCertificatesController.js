'use strict';

var _ = require('lodash');
var fs = require('fs')
var PluginService = require('../services/KongPluginService')

var KongCertificatesController  = _.merge(_.cloneDeep(require('../base/KongController')), {

    upload : function(req,res) {

        req.file('file').upload(function (err, uploadFiles) {

            var fds = []

            if(!uploadFiles.length) {

                return res.badRequest({
                    message : "No files uploaded"
                })
            }else{
                uploadFiles.forEach(function(file){
                    fds.push(fs.readFileSync(file.fd))
                })

                return PluginService.addCertificates(fds,req,res)
            }
        });

    },


    update : function(req,res) {

        req.file('file').upload(function (err, uploadFiles) {

            var fds = []

            if(uploadFiles.length) {
                uploadFiles.forEach(function(file){
                    fds.push(fs.readFileSync(file.fd))
                })
            }


            return PluginService.updateCertificates(fds,req,res)
        });

    },


})
module.exports = KongCertificatesController;
