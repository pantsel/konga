/**
 * `linkAssetsBuildProd`
 *
 * ---------------------------------------------------------------
 *
 * This Grunt tasklist is not designed to be used directly-- rather
 * it is a helper called by the `buildProd` tasklist.
 *
 * For more information see:
 *   http://sailsjs.org/documentation/anatomy/my-app/tasks/register/link-assets-build-prod-js
 *
 */
module.exports = function(grunt) {
  grunt.registerTask('linkAssetsBuildProd', [
    'sails-linker:prodJsRelative',
    'sails-linker:prodStylesRelative',
    'sails-linker:devTpl',
    'sails-linker:prodJsRelativeJade',
    'sails-linker:prodStylesRelativeJade',
    'sails-linker:devTplJade'
  ]);
};
