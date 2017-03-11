/**
 * `sync`
 *
 * ---------------------------------------------------------------
 *
 * Synchronize files from the `assets` folder to `.tmp/public`,
 * smashing anything that's already there.
 *
 * This task synchronizes one directory with another (like rsync).
 * In the default Sails asset pipeline, it plays very similar role
 * to `grunt-contrib-copy`, but copies only those files that have
 * actually changed since the last time the task was run.
 *
 * For usage docs see:
 *   https://github.com/tomusdrw/grunt-sync
 *
 */
module.exports = function(grunt) {

  grunt.config.set('sync', {
    dev: {
      files: [{
        cwd: './assets',
        src: ['**/*.!(coffee|less)'],
        dest: '.tmp/public'
      }]
    }
  });

  grunt.loadNpmTasks('grunt-sync');
};
