/**
 * grunt/pipeline.js
 *
 * The order in which your css, javascript, and template files should be
 * compiled and linked from your views and static HTML files.
 *
 * (Note that you can take advantage of Grunt-style wildcard/glob/splat expressions
 * for matching multiple files, and ! in front of an expression to ignore files.)
 *
 * For more information see:
 *   https://github.com/balderdashy/sails-docs/blob/master/anatomy/myApp/tasks/pipeline.js.md
 */


// CSS files to inject in order
//
// (if you're using LESS with the built-in default config, you'll want
//  to change `assets/styles/importer.less` instead.)
var cssFilesToInject = [
  "bower_components/angular-loading-bar/build/loading-bar.css",
  "bower_components/angular-xeditable/dist/css/xeditable.css",
  "bower_components/angular-toastr/dist/angular-toastr.css",
  "bower_components/bootstrap-switch/dist/css/bootstrap3/bootstrap-switch.css",
  "bower_components/angular-spinkit/build/angular-spinkit.min.css",
  "bower_components/angular-chips/dist/main.css",
  "bower_components/angular-json-human/dist/angular-json-human.css",
  "bower_components/mdi/css/materialdesignicons.css",
  "styles/**/*.css"
];


// Client-side javascript files to inject in order
// (uses Grunt-style wildcard/glob/splat expressions)
var jsFilesToInject = [

  // Load sails.io before everything else
  //'js/dependencies/sails.io.js',

  "bower_components/jquery/dist/jquery.js",
  "bower_components/angular/angular.js",
  "bower_components/angular-animate/angular-animate.js",
  "bower_components/angular-loading-bar/build/loading-bar.js",
  "bower_components/angular-ui-router/release/angular-ui-router.js",
  "bower_components/angular-ui-utils/ui-utils.js",
  "bower_components/moment/moment.js",
  "bower_components/later/later.js",
  "bower_components/prettycron/prettycron.js",
  "bower_components/angular-bootstrap-show-errors/src/showErrors.js",
  "bower_components/angular-sanitize/angular-sanitize.js",
  "bower_components/angular-xeditable/dist/js/xeditable.js",
  "bower_components/angular-toastr/dist/angular-toastr.tpls.js",
  "bower_components/bootstrap/dist/js/bootstrap.js",
  "bower_components/angularSails/dist/ngsails.io.js",
  "bower_components/ngstorage/ngStorage.js",
  "bower_components/bootswatch-dist/js/bootstrap.js",
  "bower_components/angular-bootstrap/ui-bootstrap-tpls.js",
  "bower_components/lodash/lodash.js",
  "bower_components/bootstrap-switch/dist/js/bootstrap-switch.js",
  "bower_components/angular-spinkit/build/angular-spinkit.js",
  "bower_components/angular-chips/dist/angular-chips.js",
  "bower_components/ng-file-upload/ng-file-upload.js",
  "bower_components/angular-messages/angular-messages.js",
  "bower_components/angular-utils-pagination/dirPagination.js",
  "bower_components/chart.js/dist/Chart.js",
  "bower_components/angular-resource/angular-resource.js",
  "bower_components/angular-moment/angular-moment.js",
  "bower_components/bootbox/bootbox.js",
  "bower_components/ngBootbox/dist/ngBootbox.js",
  "bower_components/angular-json-human/dist/angular-json-human.js",
  "bower_components/angular-bootstrap-switch/dist/angular-bootstrap-switch.js",
  "bower_components/angular-chart.js/dist/angular-chart.js",
  "bower_components/angular-base64/angular-base64.js",
  "bower_components/angular-google-chart/ng-google-chart.js",

  // All of the rest of your client-side js files
  // will be injected here in no particular order.
  'js/app/**/*.js'
];


// Client-side HTML templates are injected using the sources below
// The ordering of these templates shouldn't matter.
// (uses Grunt-style wildcard/glob/splat expressions)
//
// By default, Sails uses JST templates and precompiles them into
// functions for you.  If you want to use jade, handlebars, dust, etc.,
// with the linker, no problem-- you'll just want to make sure the precompiled
// templates get spit out to the same file.  Be sure and check out `tasks/README.md`
// for information on customizing and installing new tasks.
var templateFilesToInject = [
  'templates/**/*.html'
];


// Default path for public folder (see documentation for more information)
var tmpPath = '.tmp/public/';

// Prefix relative paths to source files so they point to the proper locations
// (i.e. where the other Grunt tasks spit them out, or in some cases, where
// they reside in the first place)
module.exports.cssFilesToInject = cssFilesToInject.map(function (cssPath) {
  // If we're ignoring the file, make sure the ! is at the beginning of the path
  if (cssPath[0] === '!') {
    return require('path').join('!.tmp/public/', cssPath.substr(1));
  }
  return require('path').join('.tmp/public/', cssPath);
});
module.exports.jsFilesToInject = jsFilesToInject.map(function (jsPath) {
  // If we're ignoring the file, make sure the ! is at the beginning of the path
  if (jsPath[0] === '!') {
    return require('path').join('!.tmp/public/', jsPath.substr(1));
  }
  return require('path').join('.tmp/public/', jsPath);
});
module.exports.templateFilesToInject = templateFilesToInject.map(function (tplPath) {
  // If we're ignoring the file, make sure the ! is at the beginning of the path
  if (tplPath[0] === '!') {
    return require('path').join('!assets/', tplPath.substr(1));
  }
  return require('path').join('assets/', tplPath);
});


