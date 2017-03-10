/**
 * `default`
 *
 * ---------------------------------------------------------------
 *
 * This is the default Grunt tasklist that will be executed if you
 * run `grunt` in the top level directory of your app.  It is also
 * called automatically when you start Sails in development mode using
 * `sails lift` or `node app`.
 *
 * Note that when lifting your app with a custom environment setting
 * (i.e. `sails.config.environment`), Sails will look for a tasklist file
 * with the same name and run that instead of this one.
 * 
 * > Note that as a special case for compatibility/historial reasons, if
 * > your environment is "production", and Sails cannot find a tasklist named
 * > `production.js`, it will attempt to run the `prod.js` tasklist as well
 * > before defaulting to `default.js`.
 *
 * For more information see:
 *   http://sailsjs.org/documentation/anatomy/my-app/tasks/register/default-js
 *
 */
module.exports = function (grunt) {
  grunt.registerTask('default', ['compileAssets', 'linkAssets',  'watch']);
};
