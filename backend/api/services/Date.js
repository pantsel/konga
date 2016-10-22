'use strict';

/**
 * /api/services/Date.js
 *
 * Generic date service which contains helper methods for date and time handling.
 */

// Module dependencies
var moment = require('moment-timezone');
var fs = require('fs');
var _ = require('lodash');

/**
 * Method converts given date object to real UTC date (actually moment) object.
 *
 * @param   {Date}  date    Date object to convert
 *
 * @returns {moment}
 */
exports.convertDateObjectToUtc = function convertDateObjectToUtc(date) {
  return moment(date).tz('Etc/Universal');
};

/**
 * Helper method to return current time as an UTC time.
 *
 * @returns {Date}
 */
exports.getCurrentDateAsUtc = function getCurrentDateAsUtc() {
  var now = new Date();

  return new Date(
    now.getUTCFullYear(),
    now.getUTCMonth(),
    now.getUTCDate(),
    now.getUTCHours(),
    now.getUTCMinutes(),
    now.getUTCSeconds()
  );
};

/**
 * Method returns available timezones. Data is read from moment-timezone npm package and parsed to array of objects
 * which can be used easily everywhere in application.
 *
 * @returns {[]}    Array of timezone data
 */
exports.getTimezones = function getTimezones() {
  var timezoneData = JSON.parse(fs.readFileSync('node_modules/moment-timezone/data/unpacked/latest.json', 'utf8'));
  var timezones = [];

  _.forEach(timezoneData.zones, function iterator(value, key) {
    timezones.push({
      id: key,
      name: value
    });
  });

  return _.uniq(_.sortBy(timezones, 'name'), false, function iterator(timezone) {
    return timezone.name;
  });
};
