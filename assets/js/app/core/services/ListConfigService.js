/**
 * Simple service to return configuration for generic list. This service contains only
 * getter methods that all list views uses in Boilerplate frontend application.
 *
 * So generally you change these getter methods and changes are affected to all list
 * views on application.
 *
 * @todo text translations
 */
(function () {
  'use strict';

  angular.module('frontend.core.services')
    .factory('ListConfig', [
      '_', 'DialogService', '$log', 'AuthService','MessageService',
      function factory(_, DialogService, $log, AuthService, MessageService) {
        /**
         * List title item configuration.
         */
        let titleItems = {
          service: [
            {
              title: 'name',
              column: 'name',
              searchable: true,
              sortable: true,
              inSearch: true,
              inTitle: true
            },
            {
              title: 'host',
              column: 'host',
              searchable: true,
              sortable: true,
              inSearch: true,
              inTitle: true
            },
            {
              title: 'tags',
              column: 'extras.tags',
              searchable: true,
              sortable: true,
              inSearch: true,
              inTitle: true
            },
            {
              title: 'created',
              column: 'created_at',
              sortable: true,
            }
          ],
          route: [
            {
              title: 'name / id',
              column: 'id',
              width: 100,
              searchable: true,
              sortable: true,
              inSearch: true,
              inTitle: true
            },
            {
              title: 'hosts',
              column: 'hosts',
              searchable: true,
              sortable: true,
              inSearch: true,
              inTitle: true
            },
            {
              title: 'service',
              column: 'service',
              searchable: true,
              sortable: true,
              inSearch: true,
              inTitle: true
            },
            {
              title: 'paths',
              column: 'paths',
              searchable: true,
              sortable: true,
              inSearch: true,
              inTitle: true
            },
            {
              title: 'created',
              column: 'created_at',
              sortable: true,
            }
          ],
          api: [
            {
              title: 'name',
              column: 'name',
              searchable: true,
              sortable: true,
              inSearch: true,
              inTitle: true
            },
            {
              title: 'upstream url',
              column: 'upstream_url',
              searchable: true,
              sortable: true,
              inSearch: true,
              inTitle: true
            },
            {
              title: 'created',
              column: 'created_at',
              sortable: true,
            }
          ],
          consumerApi: [
            {
              title: 'name',
              width: 200,
              column: 'name',
              searchable: true,
              sortable: true,
              inSearch: true,
              inTitle: true
            }
          ],
          consumerACLs: [
            {
              title: 'group',
              column: 'group',
              searchable: true,
              sortable: true,
              inSearch: true,
              inTitle: true
            }
          ],
          consumerService: [
            {
              title: 'name',
              width: 200,
              column: 'name',
              searchable: true,
              sortable: true,
              inSearch: true,
              inTitle: true
            },
            {
                title: 'host',
                column: 'host',
                searchable: true,
                sortable: true,
                inSearch: true,
                inTitle: true
            }
          ],
          consumerRoute: [
            {
              title: 'name',
              column: 'name',
              searchable: true,
              sortable: true,
              inSearch: true,
              inTitle: true
            },
            {
              title: 'hosts',
              column: 'hosts',
              searchable: true,
              sortable: true,
              inSearch: true,
              inTitle: true
            },
            {
              title: 'service',
              column: 'service',
              searchable: true,
              sortable: true,
              inSearch: true,
              inTitle: true
            },
            {
              title: 'paths',
              column: 'paths',
              searchable: true,
              sortable: true,
              inSearch: true,
              inTitle: true
            }
          ],
          target: [
            {
              title: '',
              column: '',
              width: 1
            },
            {
              title: 'target',
              column: 'target',
              searchable: true,
              sortable: true,
              inSearch: true,
              inTitle: true
            },
            {
              title: 'weight',
              column: 'weight'
            },
            {
              title: 'created',
              column: 'created_at',
              sortable: true,
            }
          ],
          upstream: [
            {
              title: '',
              column: '',
              width: 1
            },
            {
              title: 'name',
              column: 'name',
              searchable: true,
              sortable: true,
              inSearch: true,
              inTitle: true
            },
            {
              title: 'slots',
              column: 'slots'
            },
            {
              title: 'created',
              column: 'created_at',
              sortable: true,
            }
          ],
          upstreamAlert: [
            {
              title: '',
              column: '',
              width: 1
            },
            {
              title: 'Upstream',
              column: 'upstream_id',
              searchable: true,
              sortable: true,
              inSearch: true,
              inTitle: true
            },
            {
              title: 'Connection',
              column: 'connection'
            },
            {
              title: 'created',
              column: 'created_at',
              sortable: true,
            }
          ],
          kongnode: [
            {
              title: '',
              column: '',
              width: 1
            },
            {
              title: '',
              column: '',
              width: 1
            },
            {
              title: 'name',
              column: 'name',
              searchable: true,
              sortable: true,
              inSearch: true,
              inTitle: true
            },
            {
              title: 'type',
              column: 'type',
              searchable: true,
              sortable: true,
              inSearch: true,
              inTitle: true
            },
            {
              title: 'kong admin url',
              column: 'kong_admin_url',
              searchable: true,
              sortable: true,
              inSearch: true,
              inTitle: true
            },
            {
              title: 'kong version',
              column: 'kong_version'
            },
            {
              title: 'created',
              column: 'createdAt',
              sortable: true,
            },
          ],
          consumerWithCreds: [
            {
              title: '',
              width: 1
            },
            {
              title: 'username',
              column: 'username',
              searchable: true,
              sortable: true,
              inSearch: true,
              inTitle: true
            },
            {
              title: 'custom_id',
              column: 'custom_id',
              searchable: true,
              sortable: true,
              inSearch: true,
              inTitle: true
            },
            {
              title: 'Matching Credentials',
              column: 'plugins',
              searchable: true,
              sortable: true
            },
            {
              title: 'created',
              column: 'created_at',
              sortable: true,
            },
            {
              title: '',
              hide: !AuthService.hasPermission('consumers', 'delete'),
              column: false,
              width: 1
            },
          ],
          consumer: [
            {
              title: '',
              width: 1
            },
            {
              title: 'username',
              column: 'username',
              searchable: true,
              sortable: true,
              inSearch: true,
              inTitle: true
            },
            {
              title: 'custom_id',
              column: 'custom_id',
              searchable: true,
              sortable: true,
              inSearch: true,
              inTitle: true
            },
            {
              title: 'created',
              column: 'created_at',
              sortable: true,
            },
            {
              title: '',
              hide: !AuthService.hasPermission('consumers', 'delete'),
              column: false,
              width: 1
            },
          ],
          user: [
            //{
            //  title: '#',
            //  width : 1
            //},
            {
              title: '',
              column: '',
              width: 1
            },
            {
              title: 'username',
              column: 'username',
              searchable: true,
              sortable: true,
              inSearch: true,
              inTitle: true
            },
            {
              title: 'first name',
              column: 'firstName',
              searchable: true,
              sortable: true,
              inSearch: true,
              inTitle: true
            },
            {
              title: 'last name',
              column: 'lastName',
              searchable: true,
              sortable: true,
              inSearch: true,
              inTitle: true
            },
            {
              title: 'created',
              column: 'createdAt',
              sortable: true,
            },
            {
              title: 'updated',
              column: 'updatedAt',
              sortable: true,
            },
            {
              title: '',
              hide: !AuthService.hasPermission('users', 'delete'),
              column: '',
              width: 1
            },
          ],
          snapshot: [
            //{
            //  title: 'id',
            //  column: 'id',
            //  searchable: true,
            //  sortable: true,
            //  inSearch: true,
            //  inTitle: true
            //},
            {
              title: 'name',
              column: 'name',
              searchable: true,
              sortable: true,
              inSearch: true,
              inTitle: true
            },
            {
              title: 'node',
              column: 'kong_node_name',
              searchable: true,
              sortable: true,
              inSearch: true,
              inTitle: true
            },
            {
              title: 'created at',
              column: 'createdAt',
              sortable: true,
              inTitle: true
            }
          ],
          snapshotschedule: [
            {
              title: 'connection',
              column: 'connection',
              inTitle: true
            },
            {
              title: 'Schedule',
              column: 'cron',
              inTitle: true
            },
            {
              title: 'created at',
              column: 'createdAt',
              sortable: true,
              inTitle: true
            }
          ],
          plugin: [
            {
              title: 'Name',
              column: 'name',
              searchable: true,
              sortable: true,
              inSearch: true,
              inTitle: true
            },
            {
              title: 'scope',
              column: 'scope',
              searchable: true,
              sortable: true,
              inSearch: true,
              inTitle: true
            },
            {
              title: 'apply to',
              column: 'item_id',
              searchable: true,
              sortable: true,
              inSearch: true,
              inTitle: true,
            },
            {
              title: 'Consumer',
              column: 'consumer_id',
              searchable: true,
              sortable: true,
              inSearch: true,
              inTitle: true
            },
            {
              title: 'Created',
              column: 'created_at',
              class: 'col-xs-2',
              searchable: false,
              sortable: false,
              inSearch: false,
              inTitle: true
            }
          ],
          certificate: [
            {
              title: 'id',
              column: 'id',
              searchable: true,
              sortable: true,
              inSearch: true,
              inTitle: true
            },
            {
              title: 'snis',
              column: 'snis',
              searchable: true,
              sortable: true,
              inSearch: true,
              inTitle: true
            },
            {
              title: 'Created',
              column: 'created_at',
              class: 'col-xs-2',
              searchable: false,
              sortable: false,
              inSearch: false,
              inTitle: true
            }
          ],
          userlogin: [
            {
              title: 'IP-address',
              column: 'ip',
              class: 'col-xs-2',
              searchable: true,
              sortable: true,
              inSearch: true,
              inTitle: true
            },
            {
              title: 'Browser',
              column: 'browser',
              class: 'col-xs-2',
              searchable: true,
              sortable: true,
              inSearch: true,
              inTitle: true
            },
            {
              title: 'Operating System',
              column: 'os',
              class: 'col-xs-2',
              searchable: true,
              sortable: true,
              inSearch: true,
              inTitle: true
            },
            {
              title: 'Username',
              column: false,
              class: 'col-xs-2',
              searchable: false,
              sortable: false,
              inSearch: false,
              inTitle: true
            },
            {
              title: 'Login time',
              column: 'createdAt',
              class: 'col-xs-4',
              searchable: false,
              sortable: true,
              inSearch: false,
              inTitle: true
            }
          ],
          "cluster.nodes": [
            {
              title: 'Status',
              column: 'status',
              searchable: true,
              sortable: true,
              inSearch: true,
              inTitle: true
            },
            {
              title: 'Name',
              column: 'name',
              searchable: true,
              sortable: true,
              inSearch: true,
              inTitle: true
            },
            {
              title: 'Address',
              column: 'address',
              searchable: true,
              sortable: true,
              inSearch: true,
              inTitle: true
            }
          ],
          hc: [
            {
              title: '',
              column: 'active',
              sortable: true
            },
            {
              title: 'api',
              column: 'api.name',
              searchable: true,
              sortable: true,
              inSearch: true,
              inTitle: true
            },
            {
              title: 'hc endpoint',
              column: 'health_check_endpoint',
              searchable: true,
              sortable: true,
              inSearch: true,
              inTitle: true
            },
            {
              title: 'notification endpoint',
              column: 'notification_endpoint',
              searchable: true,
              sortable: true,
              inSearch: true,
              inTitle: true
            },
            {
              title: 'Created',
              column: 'created_at',
              class: 'col-xs-2',
              sortable: false
            }
          ],
        };

        let defaultLimit = 1000;

        return {
          defaultLimit: defaultLimit,
          getConfig: function getConfig(property, model) {
            return {
              itemCount: 0,
              items: [],
              itemsFetchSize: defaultLimit,
              itemsPerPage: 25,
              titleItems: this.getTitleItems(property),
              itemsPerPageOptions: [10, 25, 50, 100],
              currentPage: 1,
              sort: {
                column: 'created_at',
                direction: true,
              },
              filters: {
                searchWord: '',
                columns: this.getTitleItems(property)
              },
              where: {},
              loading: true,
              loaded: false,
              handleErrors: function (err) {
                model.scope.errors = {}
                if (err.data && err.data.body) {
                  Object.keys(err.data.body).forEach(function (key) {
                    model.scope.errors[key] = err.data.body[key]
                  })
                }
              },
              changeSort: function changeSort(item) {
                var sort = model.scope.sort;

                if (sort.column === item.column) {
                  sort.direction = !sort.direction;
                } else {
                  sort.column = item.column;
                  sort.direction = true;
                }

              },
              deleteItem: function deleteItem($index, item) {
                DialogService.prompt(
                  "Confirm", "Really want to delete the selected item?",
                  ['No don\'t', 'Yes! delete it'],
                  function accept() {

                    model.delete(item.id || item.name)
                      .then(function (res) {
                        var context = model.scope.items.data || model.scope.items;
                        context.splice(context.indexOf(item), 1);
                      }, function (err) {
                        $log.error("ListConfigService : Model delete failed => ", err)
                        MessageService.error('Something went wrong! ' + _.get(err,'data.body.message',""))
                      });
                  }, function decline() {
                  });

              }
            };
          },

          /**
           * Getter method for lists title items. These are defined in the 'titleItems'
           * variable.
           *
           * @param   {String}    model   Name of the model
           *
           * @returns {Array}
           */
          getTitleItems: function getTitleItems(model) {
            return _.isUndefined(titleItems[model]) ? [] : titleItems[model];
          }
        };
      }
    ])
  ;
}());
