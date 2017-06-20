/**
 * `sails-linker`
 *
 * ---------------------------------------------------------------
 *
 * Automatically inject <script> tags and <link> tags into the specified
 * specified HTML and/or EJS files.  The specified delimiters (`startTag`
 * and `endTag`) determine the insertion points.
 *
 * #### Development (default)
 * By default, tags will be injected for your app's client-side JavaScript files,
 * CSS stylesheets, and precompiled client-side HTML templates in the `templates/`
 * directory (see the `jst` task for more info on that).  In addition, if a LESS
 * stylesheet exists at `assets/styles/importer.less`, it will be compiled to CSS
 * and a `<link>` tag will be inserted for it.  Similarly, if any Coffeescript
 * files exists in `assets/js/`, they will be compiled into JavaScript and injected
 * as well.
 *
 * #### Production (`NODE_ENV=production`)
 * In production, all stylesheets are minified into a single `.css` file (see
 * `tasks/config/cssmin.js` task) and all client-side scripts are minified into
 * a single `.js` file (see `tasks/config/uglify.js` task).  Any client-side HTML
 * templates, CoffeeScript, or LESS files are bundled into these same two minified
 * files as well.
 *
 * For usage docs see:
 *   https://github.com/Zolmeister/grunt-sails-linker
 *
 */

var version = require('../../package.json').version

module.exports = function(grunt) {

  grunt.config.set('sails-linker', {
    devJs: {
      options: {
        startTag: '<!--SCRIPTS-->',
        endTag: '<!--SCRIPTS END-->',
        fileTmpl: '<script src="%s?r=' + version + '"></script>',
        appRoot: '.tmp/public'
      },
      files: {
        '.tmp/public/**/*.html': require('../pipeline').jsFilesToInject,
        'views/**/*.html': require('../pipeline').jsFilesToInject,
        'views/**/*.ejs': require('../pipeline').jsFilesToInject
      }
    },

    devJsRelative: {
      options: {
        startTag: '<!--SCRIPTS-->',
        endTag: '<!--SCRIPTS END-->',
        fileTmpl: '<script src="%s?r=' + version + '"></script>',
        appRoot: '.tmp/public',
        relative: true
      },
      files: {
        '.tmp/public/**/*.html': require('../pipeline').jsFilesToInject,
        'views/**/*.html': require('../pipeline').jsFilesToInject,
        'views/**/*.ejs': require('../pipeline').jsFilesToInject
      }
    },

    prodJs: {
      options: {
        startTag: '<!--SCRIPTS-->',
        endTag: '<!--SCRIPTS END-->',
        fileTmpl: '<script src="%s?r=' + version + '"></script>',
        appRoot: '.tmp/public'
      },
      files: {
        '.tmp/public/**/*.html': ['.tmp/public/min/production.min.js'],
        'views/**/*.html': ['.tmp/public/min/production.min.js'],
        'views/**/*.ejs': ['.tmp/public/min/production.min.js']
      }
    },

    prodJsRelative: {
      options: {
        startTag: '<!--SCRIPTS-->',
        endTag: '<!--SCRIPTS END-->',
        fileTmpl: '<script src="%s?r=' + version + '"></script>',
        appRoot: '.tmp/public',
        relative: true
      },
      files: {
        '.tmp/public/**/*.html': ['.tmp/public/min/production.min.js'],
        'views/**/*.html': ['.tmp/public/min/production.min.js'],
        'views/**/*.ejs': ['.tmp/public/min/production.min.js']
      }
    },

    devStyles: {
      options: {
        startTag: '<!--STYLES-->',
        endTag: '<!--STYLES END-->',
        fileTmpl: '<link rel="stylesheet" href="%s?r=' + version + '">',
        appRoot: '.tmp/public'
      },

      files: {
        '.tmp/public/**/*.html': require('../pipeline').cssFilesToInject,
        'views/**/*.html': require('../pipeline').cssFilesToInject,
        'views/**/*.ejs': require('../pipeline').cssFilesToInject
      }
    },

    devStylesRelative: {
      options: {
        startTag: '<!--STYLES-->',
        endTag: '<!--STYLES END-->',
        fileTmpl: '<link rel="stylesheet" href="%s?r=' + version + '">',
        appRoot: '.tmp/public',
        relative: true
      },

      files: {
        '.tmp/public/**/*.html': require('../pipeline').cssFilesToInject,
        'views/**/*.html': require('../pipeline').cssFilesToInject,
        'views/**/*.ejs': require('../pipeline').cssFilesToInject
      }
    },

    prodStyles: {
      options: {
        startTag: '<!--STYLES-->',
        endTag: '<!--STYLES END-->',
        fileTmpl: '<link rel="stylesheet" href="%s?r=' + version + '">',
        appRoot: '.tmp/public'
      },
      files: {
        '.tmp/public/index.html': ['.tmp/public/min/production.min.css'],
        'views/**/*.html': ['.tmp/public/min/production.min.css'],
        'views/**/*.ejs': ['.tmp/public/min/production.min.css']
      }
    },

    prodStylesRelative: {
      options: {
        startTag: '<!--STYLES-->',
        endTag: '<!--STYLES END-->',
        fileTmpl: '<link rel="stylesheet" href="%s?r=' + version + '">',
        appRoot: '.tmp/public',
        relative: true
      },
      files: {
        '.tmp/public/index.html': ['.tmp/public/min/production.min.css'],
        'views/**/*.html': ['.tmp/public/min/production.min.css'],
        'views/**/*.ejs': ['.tmp/public/min/production.min.css']
      }
    },

    // Bring in JST template object
    devTpl: {
      options: {
        startTag: '<!--TEMPLATES-->',
        endTag: '<!--TEMPLATES END-->',
        fileTmpl: '<script type="text/javascript" src="%s?r=' + version + '"></script>',
        appRoot: '.tmp/public'
      },
      files: {
        '.tmp/public/index.html': ['.tmp/public/jst.js'],
        'views/**/*.html': ['.tmp/public/jst.js'],
        'views/**/*.ejs': ['.tmp/public/jst.js']
      }
    },

    devJsJade: {
      options: {
        startTag: '// SCRIPTS',
        endTag: '// SCRIPTS END',
        fileTmpl: 'script(src="%s?r=' + version + '")',
        appRoot: '.tmp/public'
      },
      files: {
        'views/**/*.jade': require('../pipeline').jsFilesToInject
      }
    },

    devJsRelativeJade: {
      options: {
        startTag: '// SCRIPTS',
        endTag: '// SCRIPTS END',
        fileTmpl: 'script(src="%s?r=' + version + '")',
        appRoot: '.tmp/public',
        relative: true
      },
      files: {
        'views/**/*.jade': require('../pipeline').jsFilesToInject
      }
    },

    prodJsJade: {
      options: {
        startTag: '// SCRIPTS',
        endTag: '// SCRIPTS END',
        fileTmpl: 'script(src="%s?r=' + version + '")',
        appRoot: '.tmp/public'
      },
      files: {
        'views/**/*.jade': ['.tmp/public/min/production.min.js']
      }
    },

    prodJsRelativeJade: {
      options: {
        startTag: '// SCRIPTS',
        endTag: '// SCRIPTS END',
        fileTmpl: 'script(src="%s?r=' + version + '")',
        appRoot: '.tmp/public',
        relative: true
      },
      files: {
        'views/**/*.jade': ['.tmp/public/min/production.min.js']
      }
    },

    devStylesJade: {
      options: {
        startTag: '// STYLES',
        endTag: '// STYLES END',
        fileTmpl: 'link(rel="stylesheet", href="%s?r=' + version + '")',
        appRoot: '.tmp/public'
      },

      files: {
        'views/**/*.jade': require('../pipeline').cssFilesToInject
      }
    },

    devStylesRelativeJade: {
      options: {
        startTag: '// STYLES',
        endTag: '// STYLES END',
        fileTmpl: 'link(rel="stylesheet", href="%s?r=' + version + '")',
        appRoot: '.tmp/public',
        relative: true
      },

      files: {
        'views/**/*.jade': require('../pipeline').cssFilesToInject
      }
    },

    prodStylesJade: {
      options: {
        startTag: '// STYLES',
        endTag: '// STYLES END',
        fileTmpl: 'link(rel="stylesheet", href="%s?r=' + version + '")',
        appRoot: '.tmp/public'
      },
      files: {
        'views/**/*.jade': ['.tmp/public/min/production.min.css']
      }
    },

    prodStylesRelativeJade: {
      options: {
        startTag: '// STYLES',
        endTag: '// STYLES END',
        fileTmpl: 'link(rel="stylesheet", href="%s?r=' + version + '")',
        appRoot: '.tmp/public',
        relative: true
      },
      files: {
        'views/**/*.jade': ['.tmp/public/min/production.min.css']
      }
    },

    // Bring in JST template object
    devTplJade: {
      options: {
        startTag: '// TEMPLATES',
        endTag: '// TEMPLATES END',
        fileTmpl: 'script(type="text/javascript", src="%s?r=' + version + '")',
        appRoot: '.tmp/public'
      },
      files: {
        'views/**/*.jade': ['.tmp/public/jst.js']
      }
    }
  });

  grunt.loadNpmTasks('grunt-sails-linker');
};
