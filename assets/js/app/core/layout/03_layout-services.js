/**
 * This file contains all necessary Angular service definitions for 'frontend.core.layout' module.
 *
 * Note that this file should only contain services and nothing else.
 */
(function() {
  'use strict';

  // Generic service to return all available menu items for main level navigation.
  angular.module('frontend.core.layout')
    .factory('HeaderNavigationItems', [
      'AccessLevels','AuthService','$rootScope',
      function factory(AccessLevels,AuthService,$rootScope) {
        return [
          {
            state: 'dashboard',
            show : function() {
              return AuthService.isAuthenticated()
            },
            title: 'Dashboard',
            access: AccessLevels.user
          },
          {
            state: 'info',
            show : function() {
              return AuthService.isAuthenticated()
            },
            title: 'Node info',
            access: AccessLevels.user
          },
          {
            state: 'apis',
            show : function() {
              return AuthService.isAuthenticated()
            },
            title: 'APIs',
            access: AccessLevels.user
          },
          {
            state: 'consumers',
            show : function() {
              return AuthService.isAuthenticated()
            },
            title: 'Consumers',
            access: AccessLevels.user
          },
          {
            state: 'plugins',
            show : function() {
              return AuthService.isAuthenticated()
            },
            title: 'Plugins',
            access: AccessLevels.anon
          },
          {
            state: 'upstreams',
            show : function() {
              return AuthService.isAuthenticated() && $rootScope.$node && $rootScope.$node.kong_version == '0-10-x'
            },
            title: 'Upstreams',
            access: AccessLevels.anon
          }
        ];
      }
    ])
  ;

  // Generic service to return all available menu items for specified sub level navigation.
  angular.module('frontend.core.layout')
    .factory('ContentNavigationItems', [
      'AccessLevels',
      function factory(AccessLevels) {
        var items = {
          'examples': [
            {
              state: 'admin.info',
              title: 'Dashboard',
              access: AccessLevels.user
            },
            {
              state: '',
              title: 'Apis',
              access: AccessLevels.admin
            },
            {
              state: '',
              title: 'Consumers',
              access: AccessLevels.admin
            },
          ],
          'admin': [
            {
                state: 'admin.info',
                title: 'Dashboard',
                access: AccessLevels.admin
            },
            {
              state: '',
              title: 'Apis',
              access: AccessLevels.admin
            },
            {
              state: '',
              title: 'Consumers',
              access: AccessLevels.admin
            },
            //{
            //  state: '',
            //  title: 'Users',
            //  access: AccessLevels.admin
            //},
            //{
            //  state: '',
            //  title: 'Request log',
            //  access: AccessLevels.admin
            //},
            //{
            //  state: 'admin.login-history',
            //  title: 'Login history',
            //  access: AccessLevels.admin
            //}
          ]
        };

        return {
          getItems: function getItems(section) {
            return items[section];
          }
        };
      }
    ])
  ;

  /**
   * Service which contains information about all used files (back- and frontend) within specified example page.
   * These files are shown in example page info modal, so that users can easily see what current example page is
   * using to do things.
   */
  angular.module('frontend.core.layout')
    .factory('NavigationInfoModalFiles', [
      '_',
      function factory(_) {
        /**
         * Base url for code repository.
         *
         * @type {string}
         */
        var repository = 'https://github.com/tarlepp/angular-sailsjs-boilerplate/blob/master/';

        /**
         * Type configuration for files.
         *
         * @type    {{
         *            generic: {
         *              controller: string,
         *              data: string,
         *              model: string,
         *              template: string
         *            },
         *            backend: {
         *              baseController: string,
         *              baseModel: string
         *            },
         *            frontend: {
         *              module: string,
         *              listConfig: string
         *            }
         *          }}
         */
        var types = {
          generic: {
            controller: 'Used controller.',
            data: 'Initial data that is loaded to database at first time that sails lift.',
            model: 'Used model.',
            template: 'Used HTML template.'
          },
          backend: {
            baseController: 'Generic base controller that is extended by real controllers.',
            baseModel: 'Generic base model that is extended by real models.',
            policy: {
              authenticated: 'Authentication policy that will check if request contains correct JWT or not.',
              passport: 'Policy to initialize passport.js library to use.'
            }
          },
          frontend: {
            module: 'Current angular module configuration.',
            modelFactory: 'Generic model factory that all individual models uses. This contains default functions for each model.',
            dataService: 'Generic data service, which handles all the communications between back- and frontend via $sailsSocket service.',
            listConfig: 'Service that contains all list specified configurations (title items, default configurations, etc.).',
            backendConfig: 'Backend config, this contains backend url and other "static" backend specified definitions.',
            authInterceptor: 'Authentication interceptor, that attach JWT to $http and $sailsSockets requests.',
            errorInterceptor: 'Generic error interceptor, this will handle all error situations and shows those to user.',
            directive: 'Used directive(s) in this example page.'
          }
        };

        /**
         * Generic files that are used across each GUI example.
         *
         * @type    {{}}
         */
        var generic = {
          'backend': {
            'Backend <span class="text-muted">generic</span>': [
              {
                url: repository + 'backend/api/base/controller.js',
                title: 'controller.js',
                info: types.backend.baseController
              },
              {
                url: repository + 'backend/api/base/model.js',
                title: 'model.js',
                info: types.backend.baseModel
              },
              {
                url: repository + 'backend/api/policies/Authenticated.js',
                title: 'Authenticated.js',
                info: types.backend.policy.authenticated
              },
              {
                url: repository + 'backend/api/policies/Passport.js',
                title: 'Passport.js',
                info: types.backend.policy.passport
              }
            ]
          },
          'frontend': {
            'Frontend <span class="text-muted">generic</span>': [
              {
                url: repository + 'js/app/src/app/core/services/ListConfigService.js',
                title: 'ListConfigService.js',
                info: types.frontend.listConfig
              },
              {
                url: repository + 'js/app/src/app/core/models/factory.js',
                title: 'factory.js',
                info: types.frontend.modelFactory
              },
              {
                url: repository + 'js/app/src/app/core/services/DataService.js',
                title: 'DataService.js',
                info: types.frontend.dataService
              },
              {
                url: repository + 'js/app/src/app/core/constants/BackendConfig.js',
                title: 'BackendConfig.js',
                info: types.frontend.backendConfig
              },
              {
                url: repository + 'js/app/src/app/core/interceptors/AuthInterceptor.js',
                title: 'AuthInterceptor.js',
                info: types.frontend.authInterceptor
              },
              {
                url: repository + 'js/app/src/app/core/interceptors/ErrorInterceptor.js',
                title: 'ErrorInterceptor.js',
                info: types.frontend.errorInterceptor
              }
            ]
          }
        };

        /**
         * Actual data for each example page. This data contains used files in each example GUI item, these
         * files are grouped to following sections:
         *  - backend
         *  - backend (generic)
         *  - frontend
         *  - frontend (generic)
         *
         * @type    {{}}
         */
        var data = {
          'examples.books': {
            'Backend': [
              {
                url: repository + 'backend/api/models/Book.js',
                title: 'Book.js',
                info: types.generic.model
              },
              {
                url: repository + 'backend/api/controllers/BookController.js',
                title: 'BookController.js',
                info: types.generic.controller
              },
              {
                url: repository + 'backend/test/fixtures/Book.json',
                title: 'Book.json',
                info: types.generic.data
              }
            ],
            'Frontend': [
              {
                url: repository + 'js/app/src/app/examples/book/book.js',
                title: 'book.js',
                info: types.frontend.module
              },
              {
                url: repository + 'js/app/src/app/examples/book/book-controllers.js',
                title: 'book-controllers.js',
                info: types.generic.controller
              },
              {
                url: repository + 'js/app/src/app/examples/book/book-models.js',
                title: 'book-models.js',
                info: types.generic.model
              },
              {
                url: repository + 'js/app/src/app/examples/book/list.html',
                title: 'list.html',
                info: types.generic.template
              }
            ]
          },
          'examples.authors': {
            'Backend': [
              {
                url: repository + 'backend/api/models/Author.js',
                title: 'Author.js',
                info: types.generic.model
              },
              {
                url: repository + 'backend/api/controllers/AuthorController.js',
                title: 'AuthorController.js',
                info: types.generic.controller
              },
              {
                url: repository + 'backend/test/fixtures/Author.json',
                title: 'Author.json',
                info: types.generic.data
              }
            ],
            'Frontend': [
              {
                url: repository + 'js/app/src/app/examples/author/author.js',
                title: 'author.js',
                info: types.frontend.module
              },
              {
                url: repository + 'js/app/src/app/examples/author/author-controllers.js',
                title: 'author-controllers.js',
                info: types.generic.controller
              },
              {
                url: repository + 'js/app/src/app/examples/author/author-models.js',
                title: 'author-models.js',
                info: types.generic.model
              },
              {
                url: repository + 'js/app/src/app/examples/author/list.html',
                title: 'list.html',
                info: types.generic.template
              }
            ]
          },
          'examples.messages': {
            'Frontend': [
              {
                url: repository + 'js/app/src/app/examples/messages/messages.js',
                title: 'messages.js',
                info: types.frontend.module
              },
              {
                url: repository + 'js/app/src/app/examples/messages/messages-controllers.js',
                title: 'messages-controllers.js',
                info: types.generic.controller
              },
              {
                url: repository + 'js/app/src/app/examples/messages/messages.html',
                title: 'messages.html',
                info: types.generic.template
              }
            ],
            'Frontend <span class="text-muted">generic</span>': [
              {
                url: repository + 'js/app/src/app/core/interceptors/ErrorInterceptor.js',
                title: 'ErrorInterceptor.js',
                info: types.frontend.errorInterceptor
              },
              {
                url: repository + 'js/app/src/app/core/services/MessageService.js',
                title: 'MessageService.js',
                info: 'Service to show messages to users via <em>toastr</em> service.'
              },
              {
                url: repository + 'js/app/src/app/core/services/HttpStatusService.js',
                title: 'HttpStatusService.js',
                info: 'Generic HTTP status service that contains helper methods for HTTP status code handling.'
              }
            ]
          },
          'examples.chat': {
            'Backend': [
              {
                url: repository + 'backend/api/models/Message.js',
                title: 'Message.js',
                info: types.generic.model
              },
              {
                url: repository + 'backend/api/controllers/MessageController.js',
                title: 'MessageController.js',
                info: types.generic.controller
              }
            ],
            'Frontend': [
              {
                url: repository + 'js/app/src/app/examples/chat/chat.js',
                title: 'chat.js',
                info: types.frontend.module
              },
              {
                url: repository + 'js/app/src/app/examples/chat/chat-controllers.js',
                title: 'chat-controllers.js',
                info: types.generic.controller
              },
              {
                url: repository + 'js/app/src/app/examples/chat/chat-directives.js',
                title: 'chat-directives.js',
                info: types.frontend.directive
              },
              {
                url: repository + 'js/app/src/app/examples/chat/chat-models.js',
                title: 'chat-models.js',
                info: types.generic.model
              },
              {
                url: repository + 'js/app/src/app/examples/chat/chat.html',
                title: 'chat.html',
                info: types.generic.template
              }
            ]
          }
        };

        return {
          /**
           * Service function to fetch all defined backend and frontend used files.
           *
           * @returns {{}}    All the file definitions
           */
          getAll: function getAll() {
            return data;
          },
          /**
           * Service function to fetch specified GUI used backend and frontend used files.
           *
           * @param   {string}    state
           *
           * @returns {{}}
           */
          get: function get(state) {
            var files = data[state];

            switch (state) {
              case 'examples.books':
              case 'examples.authors':
              case 'examples.chat':
                files = _.merge(files, generic.backend, generic.frontend);
                break;
              default:
                break;
            }

            return files;
          }
        };
      }
    ])
  ;
}());
