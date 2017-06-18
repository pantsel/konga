/**
 * Created by user on 18/06/2017.
 */

'use strict';

var KongPluginService = require('../services/KongPluginService');

module.exports = {
    list : function (req,res) {
        return KongPluginService.richList(req,res);
    }
}