const sass = require('node-sass');

module.exports = function (grunt) {

  grunt.config.set('sass', {
    options: {
      implementation: sass,
      sourceMap: true
    },
    dev: {
      files: [{
        expand: true,
        cwd: 'assets/styles/',
        src: ['importer.scss'],
        dest: '.tmp/public/styles/',
        ext: '.css'
      }]
    }
  });

  grunt.loadNpmTasks('grunt-sass');
};