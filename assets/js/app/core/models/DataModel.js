/**
 * This file contains generic model factory that will return a specified model instance for desired endpoint with
 * given event handlers. Basically all of this boilerplate application individual models are using this service to
 * generate real model.
 */
(function() {
  'use strict';

  angular.module('frontend.core.models')
    .factory('DataModel', [
      '$sailsSocket', '$log',
      '_','$rootScope',
      'DataService','MessageService',
      function(
        $sailsSocket, $log,
        _,$rootScope,
        DataService,MessageService
      ) {
        /**
         * Constructor for actual data model.
         *
         * @param   {string}  [endpoint]  Name of the API endpoint
         * @param   {boolean}  [noPrefix]  Don't use the the /api prefix
         * @constructor
         */
        var DataModel = function(endpoint,noPrefix) {
          // Initialize default values.
          this.object = {};
          this.objects = [];

          // Cache parameters
          this.cache = {
            count: {},
            fetch: {},
            load: {}
          };

          // Is scope used with data model or not, if yes this is actual scope
          this.scope = false;

          // Scope item names for single, collection and count
          this.itemNames = {
            object: false,
            objects: false,
            count: false
          };

          // Subscribe to specified endpoint
          if (endpoint) {
            this.endpoint = noPrefix ?  endpoint : 'api/' + endpoint;

            this._subscribe();
          } else {
            this.endpoint = false;
          }
        };

        //noinspection JSUnusedGlobalSymbols
        /**
         * Service function to set used model endpoint. Note that this will also trigger subscribe for
         * this endpoint actions (created, updated, deleted, etc.).
         *
         * @param {string}  endpoint  Model endpoint definition
         */
        DataModel.prototype.setEndpoint = function setEndpoint(endpoint) {
          var self = this;

          // Set used endpoint
          self.endpoint = endpoint;

          // Subscribe to specified endpoint
          self._subscribe();
        };

        /**
         * Service function to set used model and 'item' names which are updated on specified scope when
         * socket events occurs.
         *
         * @param {{}}              scope
         * @param {string|boolean}  [nameObject]
         * @param {string|boolean}  [nameObjects]
         * @param {string|boolean}  [nameCount]
         */
        DataModel.prototype.setScope = function setScope(scope, nameObject, nameObjects, nameCount) {
          var self = this;

          self.scope = scope;
          self.itemNames = {
            object: nameObject || false,
            objects: nameObjects || false,
            count: nameCount || false
          };
        };

        //noinspection JSUnusedGlobalSymbols
        /**
         * Default behaviour for created objects for specified endpoint. If you need some custom logic
         * for your model, just overwrite this function on your model.
         *
         * @param {{
         *          verb:       String,
         *          data:       {},
         *          id:         Number,
         *          [previous]: {}
         *        }}  message
         */
        DataModel.prototype.handlerCreated = function handlerCreated(message) {
          var self = this;

          $log.log('Object created', self.endpoint, message);

          // Scope is set, so we need to load collection and determine count again
          if (self.scope) {
            if (self.itemNames.objects) {
              self.load(null, true);
            }

            if (self.itemNames.count) {
              self.count(null, true);
            }
          }
        };

        //noinspection JSUnusedGlobalSymbols
        /**
         * Default behaviour for updated objects for specified endpoint. If you need some custom logic
         * for your model, just overwrite this function on your model.
         *
         * @param {{
         *          verb:       String,
         *          data:       {},
         *          id:         Number,
         *          [previous]: {}
         *        }}  message
         */
        DataModel.prototype.handlerUpdated = function handlerUpdated(message) {
          var self = this;

          $log.log('Object updated', self.endpoint, message);

          // Scope is set, so we need to fetch collection and object data again
          if (self.scope) {
            if (self.itemNames.object && parseInt(message.id, 10) === parseInt(self.object.id, 10)) {
              self.fetch(null, null, true);
            }

            if (self.itemNames.objects) {
              self.load(null, true);
            }
          }
        };

        //noinspection JSUnusedGlobalSymbols
        /**
         * Default behaviour for deleted objects for specified endpoint. If you need some custom logic
         * for your model, just overwrite this function on your model.
         *
         * @param {{
         *          verb:       String,
         *          data:       {},
         *          id:         Number,
         *          [previous]: {}
         *        }}  message
         */
        DataModel.prototype.handlerDeleted = function handlerDeleted(message) {
          var self = this;

          $log.log('Object deleted', self.endpoint, message);

          // Scope is set, so we need to fetch collection and object data again
          if (self.scope) {
            if (self.itemNames.object && parseInt(message.id, 10) === parseInt(self.object.id, 10)) {
              $log.warn('How to handle this case?');
            }

            if (self.itemNames.objects) {
              self.load(null, true);
            }

            if (self.itemNames.count) {
              self.count(null, true);
            }
          }
        };

        //noinspection JSUnusedGlobalSymbols
        /**
         * Default behaviour for addedTo events for specified endpoint. If you need some custom logic for
         * your model, just overwrite this function on your model.
         *
         * @param {{
         *          verb:       String,
         *          data:       {},
         *          id:         Number,
         *          [previous]: {}
         *        }}  message
         */
        DataModel.prototype.handlerAddedTo = function handlerAddedTo(message) {
          var self = this;

          $log.log('AddedTo', self.endpoint, message);
        };

        //noinspection JSUnusedGlobalSymbols
        /**
         * Default behaviour for removedFrom events for specified endpoint. If you need some custom logic
         * for your model, just overwrite this function on your model.
         *
         * @param  {{
         *           verb:       String,
         *           data:       {},
         *           id:         Number,
         *           [previous]: {}
         *         }}  message
         */
        DataModel.prototype.handlerRemovedFrom = function handlerRemovedFrom(message) {
          var self = this;

          $log.log('RemovedFrom', self.endpoint, message);
        };

        /**
         * Service function to return count of objects with specified parameters.
         *
         * @param   {{}}        [parameters]    Query parameters
         * @param   {Boolean}   [fromCache]     Fetch with cache parameters
         *
         * @returns {Promise|models.count}
         */
        DataModel.prototype.count = function count(parameters, fromCache) {
          var self = this;

          // Normalize parameters
          parameters = parameters || {};
          fromCache = fromCache || false;

          if (fromCache) {
            parameters = self.cache.count.parameters;
          } else {
            // Store used parameters
            self.cache.count = {
              parameters: parameters
            };
          }

          return DataService
            .count(self.endpoint, parameters)
            .then(
              function onSuccess(response) {
                if (fromCache && self.scope && self.itemNames.count) {
                  self.scope[self.itemNames.count] = response.data.count;
                }

                return response.data;
              },
              function onError(error) {
                $log.error('DataModel.count() failed.', error, self.endpoint, parameters);
              }
            )
          ;
        };

        /**
         * Service function to load objects from specified endpoint with given parameters. Note that this
         * function will also store those objects to current service instance.
         *
         * @param   {{}}        [parameters]    Query parameters
         * @param   {Boolean}   [fromCache]     Fetch with cache parameters
         *
         * @returns {Promise|*}
         */
        DataModel.prototype.load = function load(parameters, fromCache) {
          var self = this;

          // Normalize parameters
          parameters = parameters || {};
          fromCache = fromCache || false;

          if (fromCache) {
            parameters = self.cache.load.parameters;
          } else {
            // Store used parameters
            self.cache.load = {
              parameters: parameters
            };
          }

          return DataService
            .collection(self.endpoint, parameters)
            .then(
              function onSuccess(response) {
                self.objects = response.data;

                if (fromCache && self.scope && self.itemNames.objects) {
                  self.scope[self.itemNames.objects] = self.objects;
                }

                return self.objects;
              },
              function onError(error) {
                $log.error('DataModel.load() failed.', error, self.endpoint, parameters);
                MessageService.error(_.get(error, 'data.body.message', 'An unexpected error has occurred...'))
              }
            )
          ;
        };

        /**
         * Service function to load single object from specified endpoint with given parameters. Note that
         * this will also store fetched object to current instance of this service.
         *
         * @param   {Number}    identifier      Object identifier
         * @param   {{}}        [parameters]    Query parameters
         * @param   {Boolean}   [fromCache]     Fetch with cache parameters
         *
         * @returns {Promise|*}
         */
        DataModel.prototype.fetch = function fetch(identifier, parameters, fromCache) {
          var self = this;

          // Normalize parameters
          parameters = parameters || {};
          fromCache = fromCache || false;

          if (fromCache) {
            identifier = self.cache.fetch.identifier;
            parameters = self.cache.fetch.parameters;
          } else {
            // Store identifier and used parameters to cache
            self.cache.fetch = {
              identifier: identifier,
              parameters: parameters
            };
          }

          return DataService
            .fetch(self.endpoint, identifier, parameters)
            .then(
              function onSuccess(response) {
                self.object = response.data;

                if (fromCache && self.scope && self.itemNames.object) {
                  self.scope[self.itemNames.object] = self.object;
                }

                return self.object;
              },
              function onError(error) {
                $log.error('DataModel.fetch() failed.', error, self.endpoint, identifier, parameters);
              }
            )
          ;
        };

        /**
         * Service function to create new object to current model endpoint. Note that this will also
         * trigger 'handleMessage' service function, which will handle all necessary updates to current
         * service instance.
         *
         * @param   {{}}    data    Object data to create
         *
         * @returns {Promise|*}
         */
        DataModel.prototype.create = function create(data) {
          var self = this;

          return DataService
            .create(self.endpoint, data)
        };

        /**
         * Service function to update specified object in current model endpoint. Note that this will also
         * trigger 'handleMessage' service function, which will handle all necessary updates to current
         * service instance.
         *
         * @param   {Number}    identifier  Object identifier
         * @param   {{}}        data        Object data to update
         *
         * @returns {Promise|*}
         */
        DataModel.prototype.update = function update(identifier, data) {
          var self = this;


          return DataService
            .update(self.endpoint, identifier, data);
        };



        DataModel.prototype.updateOrCreate = function updateOrCreate(data) {
          var self = this;


          return DataService
              .updateOrCreate(self.endpoint, data);
        };

        /**
         * Service function to delete specified object from current model endpoint. Note that this will
         * also trigger 'handleMessage' service function, which will handle all necessary updates to
         * current service instance.
         *
         * @param   {Number}    identifier  Object identifier
         *
         * @returns {Promise|*}
         */
        DataModel.prototype.delete = function deleteObject(identifier) {
          var self = this;

          return DataService
            .delete(self.endpoint, identifier)
            // .then(
            //   function onSuccess(result) {
            //     return result;
            //   },
            //   function onError(error) {
            //     $log.error('DataModel.delete() failed.', error, self.endpoint, identifier);
            //     return error;
            //   }
            // )
          ;
        };

        /**
         * Service function to subscribe model socket events. This is needed to update model data according
         * to another users updates (create, update, delete, etc.) within this model. Basically this will
         * just trigger one of following service function calls:
         *
         *  - handlerCreated
         *  - handlerUpdated
         *  - handlerDeleted
         *  - handlerAddedTo
         *  - handlerRemovedFrom
         *
         * @private
         */
        DataModel.prototype._subscribe = function subscribe() {

          var self = this;

            // $log.log('Subscribing to => ' + self.endpoint.replace('api/',''))

          // Actual subscribe
          $sailsSocket
            .subscribe(self.endpoint.replace('api/',''), function modelEvent(message) {

              // Handle socket event
              self._handleEvent(message);
            })
          ;
        };

        /**
         * Generic event handler for model events (created, updated, deleted, etc.). This function is
         * called from model socket events and 'create', 'update' and 'delete' service function.
         *
         * @param {{
         *          verb: String,
         *          data: {},
         *          id:   Number
         *        }}  message Message to handle
         *
         * @private
         */
        DataModel.prototype._handleEvent = function handleEvent(message) {

          var self = this;
          var method = 'handler' + message.verb[0].toUpperCase() + message.verb.slice(1);

            // $log.log('Broadcasting => ' + self.endpoint.replace("api/","") + "." + message.verb,message)

          // $rootScope.$broadcast(self.endpoint.replace("api/","") + "." + message.verb,message)

          if (_.isFunction(self[method])) {
            self[method](message);
          } else {
            $log.log('Implement handling for \'' + message.verb + '\' socket messages');
          }
        };

        return DataModel;
      }
    ])
  ;
}());
