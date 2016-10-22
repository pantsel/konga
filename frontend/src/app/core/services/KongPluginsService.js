/**
 * Simple service to activate noty2 message to GUI. This service can be used every where in application. Generally
 * all $http and $socket queries uses this service to show specified errors to user.
 *
 * Service can be used as in following examples (assuming that you have inject this service to your controller):
 *  Message.success(message, [title], [options]);
 *  Message.error(message, [title], [options]);
 *  Message.message(message, [title], [options]);
 *
 * Feel free to be happy and code some awesome stuff!
 *
 * @todo do we need some queue dismiss?
 */
(function() {
  'use strict';

  angular.module('frontend.core.services')
    .factory('KongPluginsService', [
      function factory() {

          var KongPluginsService = function() {};


          /**
           * Kong Plugin Groups
           * @returns {*[]}
           */
          KongPluginsService.prototype.pluginGroups = function(){
          return [
            {
              name : "Authentication",
              description : "Protect your services with an authentication layer",
              icon : "perm_identity",
              plugins : {
                "basic-auth": {
                  description : "Add Basic Authentication to your APIs"
                },
                "key-auth": {
                  description : "Add a key authentication to your APIs"
                },
                "oauth2": {
                  description : "Add an OAuth 2.0 authentication to your APIs"
                },
                "hmac-auth": {
                  description : "Add HMAC Authentication to your APIs"
                },
                "jwt": {
                  description : "Verify and authenticate JSON Web Tokens"
                },
                "ldap-auth": {
                  description : "Integrate Kong with a LDAP server"
                },
              }
            },
            {
              name : "Security",
              icon : "security",
              description : "Protect your services with additional security layers",
              plugins : {
                "acl": {
                  description : "Control which consumers can access APIs"
                },
                "cors": {
                  description : "Allow developers to make requests from the browser"
                },
                "ssl": {
                  description : "Add an SSL certificate for an underlying service"
                },
                "ip-restriction": {
                  description : "Whitelist or blacklist IPs that can make requests"
                },
                "bot-detection": {
                  description : "Detects and blocks bots or custom clients"
                }
              }
            },
            {
              name : "Traffic Control",
              icon : "traffic",
              description : "Manage, throttle and restrict inbound and outbound API traffic",
              plugins : {
                "rate-limiting": {
                  description : "Rate-limit how many HTTP requests a developer can make"
                },
                "response-ratelimiting": {
                  description  : "Rate-Limiting based on a custom response header value"
                },
                "request-size-limiting": {
                  description : "Block requests with bodies greater than a specific size"
                },
              }
            },
            {
              name : "Analytics & Monitoring",
              icon : "pie_chart_outlined",
              description : "Visualize, inspect and monitor APIs and microservices traffic",
              plugins : {
                "galileo": {
                  description : "Business Intelligence Platform for APIs"
                },
                "datadog": {
                  description : "Visualize API metrics on Datadog"
                },
                "runscope": {
                  description : "API Performance Testing and Monitoring"
                },

              }
            },
            {
              name : "Transformations",
              icon : "transform",
              description : "Transform request and responses on the fly on Kong",
              plugins : {
                "request-transformer": {
                  description : "Modify the request before hitting the upstream server"
                },
                "response-transformer": {
                  description : "Modify the upstream response before returning it to the client"
                },
                "correlation-id": {
                  description : "Correlate requests and responses using a unique ID"
                },
              }
            },
            {
              name : "Logging",
              icon : "content_paste",
              description : "Log requests and response data using the best transport for your infrastructure",
              plugins : {
                "tcp-log": {
                  description : "Send request and response logs to a TCP server"
                },
                "udp-log": {
                  description : "Send request and response logs to an UDP server"
                },
                "http-log": {
                  description : "Send request and response logs to an HTTP server"
                },
                "file-log": {
                  description : "Append request and response data to a log file on disk"
                },
                "syslog": {
                  description : "Send request and response logs to Syslog"
                },
                "statsd": {
                  description : "Send request and response logs to StatsD"
                },
                "loggly": {
                  description : "Send request and response logs to Loggly"
                },

              }
            }
          ]
        }


          /**
           * Kong Plugin configurations
           * @param plugin : optional
           * @returns {}
           */
          KongPluginsService.prototype.pluginOptions = function(plugin){
          var data = {
            "request-size-limiting" : {
            'consumer_id' : {
              type: 'text',
                  value: null,
                  help: 'The CONSUMER ID that this plugin configuration will target. This value can only be used if authentication has been enabled so that the system can identify the user making the request.'
            },
            'config.allowed_payload_size' : {
              type: 'number',
                  value: 128,
                  help: 'Allowed request payload size in megabytes, default is 128 (128000000 Bytes)'
            },
          },
            "bot-detection" : {
            'config.whitelist' : {
              type: 'text',
                  value: null,
                  help: 'A comma separated array of regular expressions that should be whitelisted. The regular expressions will be checked against the User-Agent header.'
            },
            'config.blacklist' : {
              type: 'text',
                  value: null,
                  help: 'A comma separated array of regular expressions that should be blacklisted. The regular expressions will be checked against the User-Agent header.'
            },
          },
            "ip-restriction" : {
            'consumer_id' : {
              type: 'text',
                  value: null,
                  help: 'The CONSUMER ID that this plugin configuration will target. This value can only be used if authentication has been enabled so that the system can identify the user making the request.'
            },
            'config.whitelist' : {
              type: 'text',
                  value: '',
                  help: 'Comma separated list of IPs or CIDR ranges to whitelist. At least one between config.whitelist or config.blacklist must be specified.'
            },
            'config.blacklist' : {
              type: 'text',
                  value: '',
                  help: 'Comma separated list of IPs or CIDR ranges to blacklist. At least one between config.whitelist or config.blacklist must be specified.'
            },
          },
            "cors" : {
            'config.origin' : {
              type: 'text',
                  value: '',
                  help: 'Value for the Access-Control-Allow-Origin header, expects a String.'
            },
            'config.methods' : {
              type: 'text',
                  value: 'GET,HEAD,PUT,PATCH,POST,DELETE',
                  help: 'Value for the Access-Control-Allow-Methods header, expects a comma delimited string (e.g. GET,POST).'
            },
            'config.headers' : {
              type: 'text',
                  value: '',
                  help: 'Value for the Access-Control-Allow-Headers header, expects a comma delimited string (e.g. Origin, Authorization).'
            },
            'config.exposed_headers' : {
              type: 'text',
                  value: '',
                  help: 'Value for the Access-Control-Expose-Headers header, expects a comma delimited string (e.g. Origin, Authorization). If not specified, no custom headers are exposed.'
            },
            'config.max_age' : {
              type: 'number',
                  help : 'Indicated how long the results of the preflight request can be cached, in seconds.'
            },
            'config.preflight_continue' : {
              type : "boolean",
                  value : false,
                  help : 'A boolean value that instructs the plugin to proxy the OPTIONS preflight request to the upstream API.'
            }
          },
            "acl" : {
            'config.whitelist' : {
              type: 'text',
                  value: '',
                  help: 'Comma separated list of arbitrary group names that are allowed to consume the API. At least one between config.whitelist or config.blacklist must be specified.'
            },
            'config.blacklist' : {
              type: 'text',
                  value: '',
                  help: 'Comma separated list of arbitrary group names that are allowed to consume the API. At least one between config.whitelist or config.blacklist must be specified.'
            }
          },
            "ldap-auth" : {
            'config.hide_credentials': {
              type: 'boolean',
                  value: false,
                  help: 'An optional boolean value telling the plugin to hide the credential to the upstream API server. It will be removed by Kong before proxying the request'
            },
            'config.ldap_host' : {
              type: 'text',
                  value: '',
                  help: 'Host on which the LDAP server is running.'
            },
            'config.ldap_port' : {
              type: 'number',
                  value: '',
                  help: 'TCP port where the LDAP server is listening.'
            },
            'config.start_tls' : {
              type: 'boolean',
                  value: false,
                  help: 'Set it to true to issue StartTLS (Transport Layer Security) extended operation over ldap connection.'
            },
            'config.base_dn' : {
              type: 'text',
                  value: '',
                  help: 'Base DN as the starting point for the search.'
            },
            'config.verify_ldap_host' : {
              type: 'boolean',
                  value: false,
                  help: 'Set it to true to authenticate LDAP server. The server certificate will be verified according to the CA certificates specified by the lua_ssl_trusted_certificate directive.'
            },
            'config.attribute' : {
              type: 'text',
                  value: '',
                  help: 'Attribute to be used to search the user.'
            },
            'config.cache_ttl' : {
              type: 'number',
                  value: 60,
                  help: 'Cache expiry time in seconds.'
            },
            'config.timeout' : {
              type: 'number',
                  value: 10000,
                  help: 'An optional timeout in milliseconds when waiting for connection with LDAP server.'
            },
            'config.keepalive' : {
              type: 'number',
                  value: 60000,
                  help: 'An optional value in milliseconds that defines for how long an idle connection to LDAP server will live before being closed.'
            },
          },
            "hmac-auth" : {
            'config.hide_credentials': {
              type: 'boolean',
                  value: false,
                  help: 'An optional boolean value telling the plugin to hide the credential to the upstream API server. It will be removed by Kong before proxying the request'
            },
            'config.clock_skew' : {
              type: 'number',
                  value: 300,
                  help: 'Clock Skew in seconds to prevent replay attacks'
            }
          },
            "basic-auth" : {
            'config.hide_credentials': {
              type: 'boolean',
                  value: false,
                  help: 'An optional boolean value telling the plugin to hide the credential to the upstream API server. It will be removed by Kong before proxying the request'
            }
          },
            "key-auth" : {
            'config.key_names': {
              type: 'text',
                  value: 'apikey',
                  help: 'Describes an array of comma separated parameter names where the plugin will look for a key. The client must send the authentication key in one of those key names, and the plugin will try to read the credential from a header or the querystring parameter with the same name.'
            },
            'config.hide_credentials': {
              type: 'boolean',
                  value: false,
                  help: 'An optional boolean value telling the plugin to hide the credential to the upstream API server. It will be removed by Kong before proxying the request.'
            }
          },
            "oauth2" : {
            'config.scopes': {
              type: 'text',
                  value: '',
                  help: 'Describes an array of comma separated scope names that will be available to the end user'
            },
            'config.mandatory_scope': {
              type: 'boolean',
                  value: false,
                  help: 'An optional boolean value telling the plugin to require at least one scope to be authorized by the end user'
            },
            'config.token_expiration' : {
              type : 'number',
                  value : 7200,
                  help : 'An optional integer value telling the plugin how long should a token last, after which the client will need to refresh the token. Set to 0 to disable the expiration.'

            },
            'config.enable_authorization_code' : {
              type: 'boolean',
                  value: false,
                  help: 'An optional boolean value to enable the three-legged Authorization Code flow (RFC 6742 Section 4.1)'
            },
            'config.enable_client_credentials': {
              type: 'boolean',
                  value: false,
                  help: 'An optional boolean value to enable the Client Credentials Grant flow (RFC 6742 Section 4.4)'
            },
            'config.enable_implicit_grant': {
              type: 'boolean',
                  value: false,
                  help: 'An optional boolean value to enable the Implicit Grant flow which allows to provision a token as a result of the authorization process (RFC 6742 Section 4.2)'
            },
            'config.enable_password_grant': {
              type: 'boolean',
                  value: false,
                  help: 'An optional boolean value to enable the Resource Owner Password Credentials Grant flow (RFC 6742 Section 4.3)'
            },
            'config.hide_credentials' : {
              type: 'boolean',
                  value: false,
                  help: 'An optional boolean value telling the plugin to hide the credential to the upstream API server. It will be removed by Kong before proxying the request'
            },
            'config.accept_http_if_already_terminated': {
              type: 'boolean',
                  value: false,
                  help: 'Accepts HTTPs requests that have already been terminated by a proxy or load balancer and the x-forwarded-proto: https header has been added to the request. Only enable this option if the Kong server cannot be publicly accessed and the only entry-point is such proxy or load balancer.'
            },
          },
            jwt : {
              'config.uri_param_names' : {
                type : 'text',
                    value : 'jwt',
                    help : 'A list of querystring parameters that Kong will inspect to retrieve JWTs.'
              },
              'config.claims_to_verify' : {
                type : 'text',
                    value : '',
                    help : 'A list of registered claims (according to RFC 7519) that Kong can verify as well. Accepted values: exp, nbf.'
              },
              'config.key_claim_name' : {
                type : 'text',
                    value : 'iss',
                    help : 'The name of the claim in which the key identifying the secret must be passed.'
              },
              'config.secret_is_base64' : {
                type : 'boolean',
                    value : false,
                    help : 'If true, the plugin assumes the credential\'s secret to be base64 encoded. You will need to create a base64 encoded secret for your consumer, and sign your JWT with the original secret.'
                }
            },
              "correlation-id" : {
                  'config.header_name' : {
                      type : 'text',
                      value : 'Kong-Request-ID',
                      help : 'The HTTP header name to use for the correlation ID.'
                  },
                  'config.generator' : {
                      type : 'select',
                      options : ['uuid','uuid#counter','tracker'],
                      value : 'uuid#counter',
                      help : 'The generator to use for the correlation ID.'
                  },
                  'config.echo_downstream' : {
                      type : 'boolean',
                      value : false,
                      help : 'Whether to echo the header back to downstream (the client).'
                  }
              },
              "datadog" : {
                  'config.consumer_id' : {
                      type : 'text',
                      value : null,
                      help : 'The CONSUMER ID that this plugin configuration will target. This value can only be used if authentication has been enabled so that the system can identify the user making the request.'
                  },
                  'config.host' : {
                      type : 'text',
                      value : '127.0.0.1',
                      help : 'The IP address or host name to send data to'
                  },
                  'config.port' : {
                      type : 'number',
                      value : 8125,
                      help : 'The port to send data to on the upstream server'
                  },
                  'config.metrics' : {
                      type : 'chips',
                      options : ['request_count','request_size','response_size','latency','status_count','unique_users','request_per_user'],
                      value : ['request_count','request_size','response_size','latency','status_count','unique_users','request_per_user'],
                      help : 'The metrics to be logged.',
                      filters : {
                          removeSelected : function(values) {
                              return function( item ) {
                                  if(values instanceof Array)
                                    return values.indexOf(item) < 0;
                                  else
                                    return values
                              };
                          }
                      }
                  },
                  'config.timeout' : {
                      type : 'number',
                      value : 10000,
                      help : 'An optional timeout in milliseconds when sending data to the upstream server'
                  },
              },
              "runscope" : {
                  "config.access_token" : {
                      type : "text",
                      value : "",
                      help : "The Runscope access token (or personal access token) for the Runscope API."
                  },
                  "config.bucket_key" : {
                      type : "text",
                      value : "",
                      help : "Your Runscope bucket ID where traffic data will be stored."
                  },
                  "config.log_body" : {
                      type : "boolean",
                      value : false,
                      help : "Whether or not the request and response bodies should be sent to Runscope."
                  },
                  "config.api_endpoint" : {
                      type : "text",
                      value : "https://api.runscope.com",
                      help : "URL for the Runscope API."
                  },
                  "config.timeout" : {
                      type : "number",
                      value : 10000,
                      help : "An optional timeout in milliseconds when sending data to Runscope.",
                  },
                  "config.keepalive" : {
                      type : "number",
                      value : 30,
                      help : "An optional value in milliseconds that defines for how long an idle connection will live before being closed.",
                  }
              },
              "galileo" : {
                  "config.consumer_id" : {
                      type : "text",
                      value : "",
                      help : "The CONSUMER ID that this plugin configuration will target. This value can only be used if authentication has been enabled so that the system can identify the user making the request.",

                  },
                  "config.service_token" : {
                      type : "text",
                      value : "",
                      help : "The service token provided to you by Galileo."
                  },
                  "config.environment" : {
                      type : "text",
                      value : "",
                      help : "Slug of your Galileo environment name. None by default."
                  },
                  "config.log_bodies" : {
                      type : "boolean",
                      value : false,
                      help : "Capture and send request/response bodies."
                  },
                  "config.retry_count" : {
                      type : "number",
                      value : 10,
                      help : "Number of retries in case of failure to send data to Galileo."
                  },
                  "config.connection_timeout" : {
                      type : "number",
                      value : 30,
                      help : "Timeout in seconds before aborting a connection to Galileo."
                  },
                  "config.flush_timeout" : {
                      type : "number",
                      value : 2,
                      help : "Timeout in seconds before flushing the current data to Galileo in case of inactivity."
                  },
                  "config.queue_size" : {
                      type : "number",
                      value : 1000,
                      help : "Number of calls to trigger a flush of the buffered data to Galileo."
                  },
                  "config.host" : {
                      type : "text",
                      value : "collector.galileo.mashape.com",
                      help : "Host address of the Galileo collector."
                  },
                  "config.port" : {
                      type : "number",
                      value : 443,
                      help : "Port of the Galileo collector."
                  },
                  "config.https" : {
                      type : "boolean",
                      value : true,
                      help : "Use of HTTPs to connect with the Galileo collector."
                  }

              },
              "rate-limiting" : {
                  "config.consumer_id" : {
                      type : "text",
                      value : "",
                      help : "The CONSUMER ID that this plugin configuration will target. This value can only be used if authentication has been enabled so that the system can identify the user making the request."
                  },
                  "config.second" : {
                      type : "number",
                      value : 0,
                      help : "The amount of HTTP requests the developer can make per second. At least one limit must exist.",

                  },
                  "config.minute" : {
                      type : "number",
                      value : 0,
                      help : "The amount of HTTP requests the developer can make per minute. At least one limit must exist.",
                  },
                  "config.hour" : {
                      type : "number",
                      value : 0,
                      help : "The amount of HTTP requests the developer can make per hour. At least one limit must exist.",
                  },
                  "config.day" : {
                      type : "number",
                      value : 0,
                      help : "The amount of HTTP requests the developer can make per day. At least one limit must exist.",
                  },
                  "config.month" : {
                      type : "number",
                      value : 0,
                      help : "The amount of HTTP requests the developer can make per month. At least one limit must exist.",
                  },
                  "config.year" : {
                      type : "number",
                      value : 0,
                      help : "The amount of HTTP requests the developer can make per year. At least one limit must exist.",
                  },
                  "config.limit_by" : {
                      type : "select",
                      options : ["consumer","credential","ip"],
                      value : "consumer",
                      help : "The entity that will be used when aggregating the limits: consumer, credential, ip. If the consumer or the credential cannot be determined, the system will always fallback to ip.",
                  },
                  "config.policy" : {
                      type : "select",
                      options : ["local","cluster","redis"],
                      value : "cluster",
                      help : "The rate-limiting policies to use for retrieving and incrementing the limits. Available values are local (counters will be stored locally in-memory on the node), cluster (counters are stored in the datastore and shared across the nodes) and redis (counters are stored on a Redis server and will be shared across the nodes).",
                  },
                  "config.fault_tolerant" : {
                      type : "boolean",
                      value : true,
                      help : "A boolean value that determines if the requests should be proxied even if Kong has troubles connecting a third-party datastore. If true requests will be proxied anyways effectively disabling the rate-limiting function until the datastore is working again. If false then the clients will see 500 errors."
                  },
                  "config.redis_host" : {
                      type : "text",
                      value : "",
                      help : "When using the redis policy, this property specifies the address to the Redis server."
                  },
                  "config.redis_port" : {
                      type : "number",
                      value : 6379,
                      help : "When using the redis policy, this property specifies the port of the Redis server. By default is 6379."
                  },
                  "config.redis_timeout" : {
                      type : "number",
                      value : 200,
                      help : "When using the redis policy, this property specifies the timeout in milliseconds of any command submitted to the Redis server."
                  }
              },
              "request-transformer" : {
                  "consumer_id" : {
                      type : "text",
                      value : "",
                      help : "The CONSUMER ID that this plugin configuration will target. This value can only be used if authentication has been enabled so that the system can identify the user making the request."
                  },
                  "config.http_method" : {
                      type : "text",
                      value : "",
                      help : "Changes the HTTP method for the upstream request."
                  },
                  "config.remove.headers" : {
                      type : "text",
                      value : "",
                      help : "List of header names. Unset the headers with the given name."
                  },
                  "config.remove.querystring" : {
                      type : "text",
                      value : "",
                      help : "List of querystring names. Remove the querystring if it is present."
                  },
                  "config.remove.body" : {
                      type : "text",
                      value : "",
                      help : "List of parameter names. Remove the parameter if and only if content-type is one the following [application/json, multipart/form-data, application/x-www-form-urlencoded] and parameter is present."
                  },
                  "config.replace.headers" : {
                      type : "text",
                      value : "",
                      help : "List of headername:value pairs. If and only if the header is already set, replace its old value with the new one. Ignored if the header is not already set."
                  },
                  "config.replace.querystring" : {
                      type : "text",
                      value : "",
                      help : "List of queryname:value pairs. If and only if the header is already set, replace its old value with the new one. Ignored if the header is not already set."
                  },
                  "config.replace.body" : {
                      type : "text",
                      value : "",
                      help : "List of paramname:value pairs. If and only if content-type is one the following [application/json, multipart/form-data, application/x-www-form-urlencoded] and the parameter is already present, replace its old value with the new one. Ignored if the parameter is not already present."
                  },
                  "config.add.headers" : {
                      type : "text",
                      value : "",
                      help : "List of headername:value pairs. If and only if the header is not already set, set a new header with the given value. Ignored if the header is already set."
                  },
                  "config.add.querystring" : {
                      type : "text",
                      value : "",
                      help : "List of queryname:value pairs. If and only if the querystring is not already set, set a new querystring with the given value. Ignored if the header is already set."
                  },
                  "config.add.body" : {
                      type : "text",
                      value : "",
                      help : "List of pramname:value pairs. If and only if content-type is one the following [application/json, multipart/form-data, application/x-www-form-urlencoded] and the parameter is not present, add a new parameter with the given value to form-encoded body. Ignored if the parameter is already present."
                  },
                  "config.append.headers" : {
                      type : "text",
                      value : "",
                      help : "List of headername:value pairs. If the header is not set, set it with the given value. If it is already set, a new header with the same name and the new value will be set."
                  },
                  "config.append.querystring" : {
                      type : "text",
                      value : "",
                      help : "List of queryname:value pairs. If the querystring is not set, set it with the given value. If it is already set, a new querystring with the same name and the new value will be set."
                  },
                  "config.append.body" : {
                      type : "text",
                      value : "",
                      help : "List of paramname:value pairs. If the content-type is one the following [application/json, application/x-www-form-urlencoded], add a new parameter with the given value if the parameter is not present, otherwise if it is already present, the two values (old and new) will be aggregated in an array."
                  }

              },

              "response-transformer" : {
                  "consumer_id" : {
                      type : "text",
                      value : "",
                      help : "The CONSUMER ID that this plugin configuration will target. This value can only be used if authentication has been enabled so that the system can identify the user making the request."
                  },
                  "config.remove.headers" : {
                      type : "text",
                      value : "",
                      help : "List of header names. Unset the header(s) with the given name."
                  },
                  "config.remove.json" : {
                      type : "text",
                      value : "",
                      help : "List of property names. Remove the property from the JSON body if it is present."
                  },
                  "config.replace.headers" : {
                      type : "text",
                      value : "",
                      help : "List of headername:value pairs. If and only if the header is already set, replace its old value with the new one. Ignored if the header is not already set."
                  },
                  "config.replace.json" : {
                      type : "text",
                      value : "",
                      help : "List of property:value pairs. If and only if the parameter is already present, replace its old value with the new one. Ignored if the parameter is not already present."
                  },
                  "config.add.headers" : {
                      type : "text",
                      value : "",
                      help : "List of headername:value pairs. If and only if the header is not already set, set a new header with the given value. Ignored if the header is already set."
                  },
                  "config.add.json" : {
                      type : "text",
                      value : "",
                      help : "List of property:value pairs. If and only if the property is not present, add a new property with the given value to the JSON body. Ignored if the property is already present."
                  },
                  "config.append.headers" : {
                      type : "text",
                      value : "",
                      help : "List of headername:value pairs. If the header is not set, set it with the given value. If it is already set, a new header with the same name and the new value will be set."
                  },
                  "config.append.json" : {
                      type : "text",
                      value : "",
                      help : "List of property:value pairs. If the property is not present in the JSON body, add it with the given value. If it is already present, the two values (old and new) will be aggregated in an array."
                  },
              }
          }

          return plugin ? data[plugin] : data
        }


          return KongPluginsService

      }
    ])
  ;
}());
