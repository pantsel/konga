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
(function () {
  'use strict';

  angular.module('frontend.core.services')
    .factory('KongPluginsService', ['InfoService',
      function factory(InfoService) {

        var self;
        var KongPluginsService = function () {
          self = this
        };


        function inGroups(plugin_name) {
          var found = false
          self.pluginGroups().forEach(function (group) {
            Object.keys(group.plugins).forEach(function (group_plugin_name) {
              if (plugin_name === group_plugin_name) {
                found = true
              }
            })
          })

          return found;
        }


        KongPluginsService.prototype.makePluginGroups = function () {
          return InfoService.getInfo().then(function (resp) {
            var info = resp.data
            var plugins_available = info.plugins.available_on_server
            var pluginGroups = self.pluginGroups()

            Object.keys(plugins_available).forEach(function (plugin_name) {
              if (!inGroups(plugin_name)) {
                pluginGroups[pluginGroups.length - 1].plugins[plugin_name] = {};
              }
            })

            return pluginGroups;


          });
        },


          /**
           * Kong Plugin Groups
           * @returns {*[]}
           */
          KongPluginsService.prototype.pluginGroups = function () {
            return [
              {
                name: "Authentication",
                description: "Protect your services with an authentication layer",
                icon: "mdi-account-outline",
                hasConsumerPlugins: false,
                plugins: {
                  "basic-auth": {
                    description: "Add Basic Authentication to your APIs"
                  },
                  "key-auth": {
                    description: "Add a key authentication to your APIs"
                  },
                  "oauth2": {
                    description: "Add an OAuth 2.0 authentication to your APIs"
                  },
                  "hmac-auth": {
                    description: "Add HMAC Authentication to your APIs"
                  },
                  "jwt": {
                    description: "Verify and authenticate JSON Web Tokens"
                  },
                  "ldap-auth": {
                    description: "Integrate Kong with a LDAP server"
                  },
                }
              },
              {
                name: "Security",
                icon: "mdi-security",
                hasConsumerPlugins: true,
                description: "Protect your services with additional security layers",
                plugins: {
                  "acl": {
                    hideIfNotInConsumerContext: true,
                    description: "Control which consumers can access APIs"
                  },
                  "cors": {
                    hideIfNotInConsumerContext: true,
                    description: "Allow developers to make requests from the browser"
                  },
                  "ssl": {
                    hideIfNotInConsumerContext: true,
                    description: "Add an SSL certificate for an underlying service"
                  },
                  "ip-restriction": {
                    description: "Whitelist or blacklist IPs that can make requests"
                  },
                  "bot-detection": {
                    hideIfNotInConsumerContext: true,
                    description: "Detects and blocks bots or custom clients"
                  }
                }
              },
              {
                name: "Traffic Control",
                icon: "mdi-traffic-light",
                hasConsumerPlugins: true,
                description: "Manage, throttle and restrict inbound and outbound API traffic",
                plugins: {
                  "rate-limiting": {
                    description: "Rate-limit how many HTTP requests a developer can make"
                  },
                  "response-ratelimiting": {
                    description: "Rate-Limiting based on a custom response header value"
                  },
                  "request-size-limiting": {
                    description: "Block requests with bodies greater than a specific size"
                  },
                  "request-termination": {
                    description: "This plugin terminates incoming requests with a specified status code and message. This allows to (temporarily) block an API or Consumer."
                  },
                }
              },
              {
                name: "Serverless",
                description: "Invoke serverless functions in combination with other plugins:",
                icon: "mdi-cloud-sync",
                hasConsumerPlugins: true,
                plugins: {
                  "aws-lambda": {
                    description: "Invoke an AWS Lambda function from Kong. It can be used in combination with other request plugins to secure, manage or extend the function."
                  },
                  "pre-function": {
                    hideIfNotInConsumerContext: true,
                    description: "Dynamically run Lua code from Kong during access phase."
                  },
                  "post-function": {
                    hideIfNotInConsumerContext: true,
                    description: "Dynamically run Lua code from Kong during access phase."
                  },
                  "azure-functions": {
                    description: "This plugin invokes Azure Functions. It can be used in combination with other request plugins to secure, manage or extend the function"
                  }
                }
              },
              {
                name: "Analytics & Monitoring",
                hasConsumerPlugins: true,
                icon: "mdi-chart-bar",
                description: "Visualize, inspect and monitor APIs and microservices traffic",
                plugins: {
                  "galileo": {
                    description: "Business Intelligence Platform for APIs"
                  },
                  "datadog": {
                    description: "Visualize API metrics on Datadog"
                  },
                  "runscope": {
                    description: "API Performance Testing and Monitoring"
                  },
                  "prometheus": {
                    description: "Expose metrics related to Kong and proxied upstream services in Prometheus exposition format"
                  },
                  "zipkin": {
                    description: "Propagate Zipkin distributed tracing spans, and report spans to a Zipkin server."
                  },

                }
              },
              {
                name: "Transformations",
                hasConsumerPlugins: true,
                icon: "mdi-nfc-tap",
                description: "Transform request and responses on the fly on Kong",
                plugins: {
                  "request-transformer": {
                    description: "Modify the request before hitting the upstream server"
                  },
                  "response-transformer": {
                    description: "Modify the upstream response before returning it to the client"
                  },
                  "correlation-id": {
                    description: "Correlate requests and responses using a unique ID"
                  },
                }
              },
              {
                name: "Logging",
                hasConsumerPlugins: true,
                icon: "mdi-content-paste",
                description: "Log requests and response data using the best transport for your infrastructure",
                plugins: {
                  "tcp-log": {
                    description: "Send request and response logs to a TCP server"
                  },
                  "udp-log": {
                    description: "Send request and response logs to an UDP server"
                  },
                  "http-log": {
                    description: "Send request and response logs to an HTTP server"
                  },
                  "file-log": {
                    description: "Append request and response data to a log file on disk"
                  },
                  "syslog": {
                    description: "Send request and response logs to Syslog"
                  },
                  "statsd": {
                    description: "Send request and response logs to StatsD"
                  },
                  "loggly": {
                    description: "Send request and response logs to Loggly"
                  },

                }
              },
              {
                name: "Custom",
                description: "Custom Plugins",
                icon: "mdi-account-box-outline",
                hasConsumerPlugins: true,
                plugins: {}
              }
            ]
          }


        /**
         * Kong Plugin configurations
         * @param plugin : optional
         * @returns {}
         */
        KongPluginsService.prototype.pluginOptions = function (plugin) {
          var data = {
            "ssl": {
              "meta": {
                description: 'Dynamically binds a specific SSL certificate to the <code>request_host</code> value of a service. ' +
                'In case you want to setup a global SSL certificate for every API, take a look at the <a href="https://getkong.org/docs/0.9.x/configuration/#ssl_cert_path" target="_blank">Kong SSL configuration options.</a>' +
                '<br><span>If no <code>.cert</code> and <code>.key</code> files are provided, Konga will create self-signed certificates and send them to Kong ( <a href="https://www.openssl.org/">openssl library</a> must be available on your machine ).</span>'
              },
              "cert": {
                type: "file",
                help: "Upload the certificate.crt file."
              },
              "key": {
                type: "file",
                help: "Upload the certificate.key file."
              },
              "only_https": {
                type: "boolean",
                value: false,
                help: "Specify if the service should only be available through an https protocol."
              },
              "accept_http_if_already_terminated": {
                type: "boolean",
                value: false,
                help: "If only_https is true, accepts HTTPs requests that have already been terminated by a proxy or load balancer and the x-forwarded-proto: https header has been added to the request. Only enable this option if the Kong server cannot be publicly accessed and the only entry-point is such proxy or load balancer."
              },
            },
            "request-size-limiting": {
              meta: {
                description: 'Block incoming requests whose body is greater than a specific size in megabytes.'
              },

              'consumer_id': {
                displayName: "Apply to",
                type: 'search',
                value: null,
                help: 'The CONSUMER ID that this plugin configuration will target. ' +
                'This value can only be used if authentication has been enabled ' +
                'so that the system can identify the user making the request.' +
                ' If left blank, the plugin will be applied to all consumers.'
              },
              'allowed_payload_size': {
                type: 'number',
                value: 128,
                help: 'Allowed request payload size in megabytes, default is 128 (128000000 Bytes)'
              },
            },
            "request-termination": {
              meta: {
                description: 'This plugin terminates incoming requests with a specified status code and message. This allows to (temporarily) block an API or Consumer.'
              },
              content_type: {
                type: 'text',
                value: 'application/json; charset=utf-8',
                help: 'Content type of the raw response configured with config.body.'
              },
              status_code: {
                type: 'number',
                value: 503,
                help: 'The response code to send.'
              },
              message: {
                type: 'text',
                help: 'The message to send, if using the default response generator.'
              },
              body: {
                type: 'text',
                help: 'The raw response body to send, this is mutually exclusive with the config.message field.'
              }

            },
            "bot-detection": {
              'meta': {
                description: 'Protects your API from most common bots and has the capability of whitelisting and blacklisting custom clients.'
              },
              'whitelist': {
                type: 'text',
                value: null,
                help: 'A comma separated array of regular expressions that should be whitelisted. The regular expressions will be checked against the User-Agent header.'
              },
              'blacklist': {
                type: 'text',
                value: null,
                help: 'A comma separated array of regular expressions that should be blacklisted. The regular expressions will be checked against the User-Agent header.'
              },
            },
            "ip-restriction": {
              meta: {
                description: 'Restrict access to an API by either whitelisting or blacklisting IP addresses. Single IPs, multiple IPs or ranges in <a href="https://en.wikipedia.org/wiki/Classless_Inter-Domain_Routing#CIDR_notation">CIDR notation</a> like <code>10.10.10.0/24</code> can be used.'
              },
              'consumer_id': {
                displayName: "Apply to",
                type: 'text',
                value: null,
                help: 'The CONSUMER ID that this plugin configuration will target. ' +
                'This value can only be used if authentication has been enabled ' +
                'so that the system can identify the user making the request.' +
                ' If left blank, the plugin will be applied to all consumers.'
              },
              'whitelist': {
                type: 'text',
                value: '',
                help: 'Comma separated list of IPs or CIDR ranges to whitelist. At least one between whitelist or blacklist must be specified.'
              },
              'blacklist': {
                type: 'text',
                value: '',
                help: 'Comma separated list of IPs or CIDR ranges to blacklist. At least one between whitelist or blacklist must be specified.'
              },
            },
            "cors": {
              meta: {
                description: 'Easily add <strong>Cross-origin resource sharing (CORS)</strong> to your API by enabling this plugin.'
              },
              'origin': {
                type: 'text',
                value: '',
                help: 'Value for the Access-Control-Allow-Origin header, expects a String.'
              },
              'methods': {
                type: 'text',
                value: 'GET,HEAD,PUT,PATCH,POST,DELETE',
                help: 'Value for the Access-Control-Allow-Methods header, expects a comma delimited string (e.g. GET,POST).'
              },
              'headers': {
                type: 'text',
                value: '',
                help: 'Value for the Access-Control-Allow-Headers header, expects a comma delimited string (e.g. Origin, Authorization).'
              },
              'exposed_headers': {
                type: 'text',
                value: '',
                help: 'Value for the Access-Control-Expose-Headers header, expects a comma delimited string (e.g. Origin, Authorization). If not specified, no custom headers are exposed.'
              },
              'max_age': {
                type: 'number',
                help: 'Indicated how long the results of the preflight request can be cached, in seconds.'
              },
              'preflight_continue': {
                type: "boolean",
                value: false,
                help: 'A boolean value that instructs the plugin to proxy the OPTIONS preflight request to the upstream API.'
              },
              'credentials': {
                type: "boolean",
                value: false,
                help: 'Flag to determine whether the Access-Control-Allow-Credentials header should be sent with true as the value.'
              }
            },
            "acl": {
              meta: {
                description: 'Restrict access to an API by whitelisting or blacklisting consumers using arbitrary ACL group names. This plugin requires an <strong>authentication plugin</strong> to have been already enabled on the API.'
              },
              'whitelist': {
                type: 'text',
                value: '',
                help: 'Comma separated list of arbitrary group names that are allowed to consume the API. At least one between whitelist or blacklist must be specified.'
              },
              'blacklist': {
                type: 'text',
                value: '',
                help: 'Comma separated list of arbitrary group names that are not allowed to consume the API. At least one between whitelist or blacklist must be specified.'
              }
            },
            "ldap-auth": {
              meta: {
                description: 'Add LDAP Bind Authentication to your APIs, with username and password protection. The plugin will check for valid credentials in the <code>Proxy-Authorization</code> and <code>Authorization</code> header (in this order).'
              },
              'hide_credentials': {
                type: 'boolean',
                value: false,
                help: 'An optional boolean value telling the plugin to hide the credential to the upstream API server. It will be removed by Kong before proxying the request'
              },
              'ldap_host': {
                type: 'text',
                value: '',
                help: 'Host on which the LDAP server is running.'
              },
              'ldap_port': {
                type: 'number',
                value: '',
                help: 'TCP port where the LDAP server is listening.'
              },
              'start_tls': {
                type: 'boolean',
                value: false,
                help: 'Set it to true to issue StartTLS (Transport Layer Security) extended operation over ldap connection.'
              },
              'base_dn': {
                type: 'text',
                value: '',
                help: 'Base DN as the starting point for the search.'
              },
              'verify_ldap_host': {
                type: 'boolean',
                value: false,
                help: 'Set it to true to authenticate LDAP server. The server certificate will be verified according to the CA certificates specified by the lua_ssl_trusted_certificate directive.'
              },
              'attribute': {
                type: 'text',
                value: '',
                help: 'Attribute to be used to search the user.'
              },
              'cache_ttl': {
                type: 'number',
                value: 60,
                help: 'Cache expiry time in seconds.'
              },
              'timeout': {
                type: 'number',
                value: 10000,
                help: 'An optional timeout in milliseconds when waiting for connection with LDAP server.'
              },
              'keepalive': {
                type: 'number',
                value: 60000,
                help: 'An optional value in milliseconds that defines for how long an idle connection to LDAP server will live before being closed.'
              },
            },
            "hmac-auth": {
              meta: {
                description: 'Add HMAC Signature Authentication to your APIs to establish the identity of the consumer. The plugin will check for valid signature in the <code>Proxy-Authorization</code> and <code>Authorization</code> header (in this order). This plugin implementation follows the <a href="https://tools.ietf.org/html/draft-cavage-http-signatures-00">draft-cavage-http-signatures-00</a> draft with slightly changed signature scheme.'
              },
              'hide_credentials': {
                type: 'boolean',
                value: false,
                help: 'An optional boolean value telling the plugin to hide the credential to the upstream API server. It will be removed by Kong before proxying the request'
              },
              'clock_skew': {
                type: 'number',
                value: 300,
                help: 'Clock Skew in seconds to prevent replay attacks'
              }
            },
            "basic-auth": {
              meta: {
                description: 'Add Basic Authentication to your APIs, with username and password protection. The plugin will check for valid credentials in the <code>Proxy-Authorization</code> and <code>Authorization</code> header (in this order).',
              },
              'hide_credentials': {
                type: 'boolean',
                value: false,
                help: 'An optional boolean value telling the plugin to hide the credential to the upstream API server. It will be removed by Kong before proxying the request'
              }
            },
            "key-auth": {
              meta: {
                description: 'Add Key Authentication (also referred to as an API key) to your APIs. Consumers then add their key either in a querystring parameter or a header to authenticate their requests.'
              },
              'key_names': {
                type: 'text',
                value: 'apikey',
                help: 'Describes an array of comma separated parameter names where the plugin will look for a key. The client must send the authentication key in one of those key names, and the plugin will try to read the credential from a header or the querystring parameter with the same name.'
              },
              'hide_credentials': {
                type: 'boolean',
                value: false,
                help: 'An optional boolean value telling the plugin to hide the credential to the upstream API server. It will be removed by Kong before proxying the request.'
              }
            },
            "oauth2": {
              meta: {
                description: 'Add an OAuth 2.0 authentication layer with the <a href="https://tools.ietf.org/html/rfc6749#section-4.1" target="_blank">Authorization Code Grant</a>, <a href="https://tools.ietf.org/html/rfc6749#section-4.4" target="_blank">Client Credentials</a>, <a href="https://tools.ietf.org/html/rfc6749#section-4.2" target="_blank">Implicit Grant</a> or <a href="https://tools.ietf.org/html/rfc6749#section-4.3" target="_blank">Resource Owner Password Credentials Grant</a> flow. This plugin requires the <a href="https://getkong.org/plugins/dynamic-ssl/" target="_blank">SSL Plugin</a> with the <code>only_https</code> parameter set to <code>true</code> to be already installed on the API, failing to do so will result in a security weakness.'
              },
              'scopes': {
                type: 'text',
                value: '',
                help: 'Describes an array of comma separated scope names that will be available to the end user'
              },
              'mandatory_scope': {
                type: 'boolean',
                value: false,
                help: 'An optional boolean value telling the plugin to require at least one scope to be authorized by the end user'
              },
              'token_expiration': {
                type: 'number',
                value: 7200,
                help: 'An optional integer value telling the plugin how long should a token last, after which the client will need to refresh the token. Set to 0 to disable the expiration.'

              },
              'enable_authorization_code': {
                type: 'boolean',
                value: false,
                help: 'An optional boolean value to enable the three-legged Authorization Code flow (RFC 6742 Section 4.1)'
              },
              'enable_client_credentials': {
                type: 'boolean',
                value: false,
                help: 'An optional boolean value to enable the Client Credentials Grant flow (RFC 6742 Section 4.4)'
              },
              'enable_implicit_grant': {
                type: 'boolean',
                value: false,
                help: 'An optional boolean value to enable the Implicit Grant flow which allows to provision a token as a result of the authorization process (RFC 6742 Section 4.2)'
              },
              'enable_password_grant': {
                type: 'boolean',
                value: false,
                help: 'An optional boolean value to enable the Resource Owner Password Credentials Grant flow (RFC 6742 Section 4.3)'
              },
              'hide_credentials': {
                type: 'boolean',
                value: false,
                help: 'An optional boolean value telling the plugin to hide the credential to the upstream API server. It will be removed by Kong before proxying the request'
              },
              'accept_http_if_already_terminated': {
                type: 'boolean',
                value: false,
                help: 'Accepts HTTPs requests that have already been terminated by a proxy or load balancer and the x-forwarded-proto: https header has been added to the request. Only enable this option if the Kong server cannot be publicly accessed and the only entry-point is such proxy or load balancer.'
              },
            },
            jwt: {
              meta: {
                description: 'Verify requests containing HS256 or RS256 signed JSON Web Tokens (as specified in RFC 7519). Each of your Consumers will have JWT credentials (public and secret keys) which must be used to sign their JWTs. A token can then be passed through the Authorization header or in the request\'s URI and Kong will either proxy the request to your upstream services if the token\'s signature is verified, or discard the request if not. Kong can also perform verifications on some of the registered claims of <a href="https://tools.ietf.org/html/rfc7519">RFC 7519</a> (exp and nbf).'
              },
              'uri_param_names': {
                type: 'text',
                value: 'jwt',
                help: 'A list of querystring parameters that Kong will inspect to retrieve JWTs.'
              },
              'claims_to_verify': {
                type: 'text',
                value: '',
                help: 'A list of registered claims (according to RFC 7519) that Kong can verify as well. Accepted values: exp, nbf.'
              },
              'key_claim_name': {
                type: 'text',
                value: 'iss',
                help: 'The name of the claim in which the key identifying the secret must be passed.'
              },
              'secret_is_base64': {
                type: 'boolean',
                value: false,
                help: 'If true, the plugin assumes the credential\'s secret to be base64 encoded. You will need to create a base64 encoded secret for your consumer, and sign your JWT with the original secret.'
              }
            },
            "correlation-id": {
              meta: {
                description: 'Correlate requests and responses using a unique ID transmitted over an HTTP header.'
              },
              'header_name': {
                type: 'text',
                value: 'Kong-Request-ID',
                help: 'The HTTP header name to use for the correlation ID.'
              },
              'generator': {
                type: 'select',
                options: ['uuid', 'uuid#counter', 'tracker'],
                value: 'uuid#counter',
                help: 'The generator to use for the correlation ID.'
              },
              'echo_downstream': {
                type: 'boolean',
                value: false,
                help: 'Whether to echo the header back to downstream (the client).'
              }
            },
            "datadog": {
              meta: {
                description: 'Log API metrics like request count, request size, response status and latency to the local <a href="http://docs.datadoghq.com/guides/basic_agent_usage/">Datadog agent</a>.'
              },
              'consumer_id': {
                displayName: "Apply to",
                type: 'search',
                value: null,
                help: 'The CONSUMER ID that this plugin configuration will target. ' +
                'This value can only be used if authentication has been enabled ' +
                'so that the system can identify the user making the request.' +
                ' If left blank, the plugin will be applied to all consumers.'
              },
              'host': {
                type: 'text',
                value: '127.0.0.1',
                help: 'The IP address or host name to send data to'
              },
              'port': {
                type: 'number',
                value: 8125,
                help: 'The port to send data to on the upstream server'
              },
              'metrics': {
                type: 'chips',
                options: ['request_count', 'request_size', 'response_size', 'latency', 'status_count', 'unique_users', 'request_per_user'],
                value: ['request_count', 'request_size', 'response_size', 'latency', 'status_count', 'unique_users', 'request_per_user'],
                help: 'The metrics to be logged.',
                filters: {
                  removeSelected: function (values) {
                    return function (item) {
                      if (values instanceof Array)
                        return values.indexOf(item) < 0;
                      else
                        return values
                    };
                  }
                }
              },
              'timeout': {
                type: 'number',
                value: 10000,
                help: 'An optional timeout in milliseconds when sending data to the upstream server'
              },
            },
            "runscope": {
              meta: {
                description: 'Logs request and response data to <a href="https://www.runscope.com/">Runscope</a>.'
              },
              "access_token": {
                type: "text",
                value: "",
                help: "The Runscope access token (or personal access token) for the Runscope API."
              },
              "bucket_key": {
                type: "text",
                value: "",
                help: "Your Runscope bucket ID where traffic data will be stored."
              },
              "log_body": {
                type: "boolean",
                value: false,
                help: "Whether or not the request and response bodies should be sent to Runscope."
              },
              "api_endpoint": {
                type: "text",
                value: "https://api.runscope.com",
                help: "URL for the Runscope API."
              },
              "timeout": {
                type: "number",
                value: 10000,
                help: "An optional timeout in milliseconds when sending data to Runscope.",
              },
              "keepalive": {
                type: "number",
                value: 30,
                help: "An optional value in milliseconds that defines for how long an idle connection will live before being closed.",
              }
            },
            "galileo": {
              meta: {
                description: 'Logs request and response data to <a href="https://getgalileo.io/">Galileo</a>, the analytics platform for monitoring, visualizing and inspecting API & microservice traffic.'
              },
              "consumer_id": {
                displayName: "Apply to",
                type: 'search',
                value: "",
                help: "The CONSUMER ID that this plugin configuration will target. " +
                "This value can only be used if authentication has been enabled " +
                "so that the system can identify the user making the request." +
                " If left blank, the plugin will be applied to all consumers.",

              },
              "service_token": {
                type: "text",
                value: "",
                help: "The service token provided to you by Galileo."
              },
              "environment": {
                type: "text",
                value: "",
                help: "Slug of your Galileo environment name. None by default."
              },
              "log_bodies": {
                type: "boolean",
                value: false,
                help: "Capture and send request/response bodies."
              },
              "retry_count": {
                type: "number",
                value: 10,
                help: "Number of retries in case of failure to send data to Galileo."
              },
              "connection_timeout": {
                type: "number",
                value: 30,
                help: "Timeout in seconds before aborting a connection to Galileo."
              },
              "flush_timeout": {
                type: "number",
                value: 2,
                help: "Timeout in seconds before flushing the current data to Galileo in case of inactivity."
              },
              "queue_size": {
                type: "number",
                value: 1000,
                help: "Number of calls to trigger a flush of the buffered data to Galileo."
              },
              "host": {
                type: "text",
                value: "collector.galileo.mashape.com",
                help: "Host address of the Galileo collector."
              },
              "port": {
                type: "number",
                value: 443,
                help: "Port of the Galileo collector."
              },
              "https": {
                type: "boolean",
                value: true,
                help: "Use of HTTPs to connect with the Galileo collector."
              }

            },
            "rate-limiting": {
              meta: {
                description: 'Rate limit how many HTTP requests a developer can make in a given period of seconds, minutes, hours, days, months or years. If the API has no authentication layer, the <strong>Client IP</strong> address will be used, otherwise the Consumer will be used if an authentication plugin has been configured.'
              },
              "consumer_id": {
                displayName: "Apply to",
                type: 'search',
                value: "",
                help: "The CONSUMER ID that this plugin configuration will target. " +
                "This value can only be used if authentication has been enabled " +
                "so that the system can identify the user making the request." +
                " If left blank, the plugin will target all consumers."
              },
              "second": {
                type: "number",
                value: 0,
                help: "The amount of HTTP requests the developer can make per second. At least one limit must exist.",

              },
              "minute": {
                type: "number",
                value: 0,
                help: "The amount of HTTP requests the developer can make per minute. At least one limit must exist.",
              },
              "hour": {
                type: "number",
                value: 0,
                help: "The amount of HTTP requests the developer can make per hour. At least one limit must exist.",
              },
              "day": {
                type: "number",
                value: 0,
                help: "The amount of HTTP requests the developer can make per day. At least one limit must exist.",
              },
              "month": {
                type: "number",
                value: 0,
                help: "The amount of HTTP requests the developer can make per month. At least one limit must exist.",
              },
              "year": {
                type: "number",
                value: 0,
                help: "The amount of HTTP requests the developer can make per year. At least one limit must exist.",
              },
              "limit_by": {
                type: "select",
                options: ["consumer", "credential", "ip"],
                value: "consumer",
                help: "The entity that will be used when aggregating the limits: consumer, credential, ip. If the consumer or the credential cannot be determined, the system will always fallback to ip.",
              },
              "policy": {
                type: "select",
                options: ["local", "cluster", "redis"],
                value: "cluster",
                help: "The rate-limiting policies to use for retrieving and incrementing the limits. Available values are local (counters will be stored locally in-memory on the node), cluster (counters are stored in the datastore and shared across the nodes) and redis (counters are stored on a Redis server and will be shared across the nodes).",
              },
              "fault_tolerant": {
                type: "boolean",
                value: true,
                help: "A boolean value that determines if the requests should be proxied even if Kong has troubles connecting a third-party datastore. If true requests will be proxied anyways effectively disabling the rate-limiting function until the datastore is working again. If false then the clients will see 500 errors."
              },
              "redis_host": {
                type: "text",
                value: "",
                help: "When using the redis policy, this property specifies the address to the Redis server."
              },
              "redis_port": {
                type: "number",
                value: 6379,
                help: "When using the redis policy, this property specifies the port of the Redis server. By default is 6379."
              },
              "redis_timeout": {
                type: "number",
                value: 200,
                help: "When using the redis policy, this property specifies the timeout in milliseconds of any command submitted to the Redis server."
              }
            },
            "request-transformer": {
              meta: {
                description: 'Transform the request sent by a client on the fly on Kong, before hitting the upstream server.'
              },
              "http_method": {
                help: "Changes the HTTP method for the upstream request."
              },
              "remove": {
                "headers": {
                  help: "List of header names. Unset the headers with the given name."
                },
                "querystring": {
                  help: "List of querystring names. Remove the querystring if it is present."
                },
                "body": {
                  help: "List of parameter names. Remove the parameter if and only if content-type is one the following [application/json, multipart/form-data, application/x-www-form-urlencoded] and parameter is present."
                },
              },
              "replace": {
                "headers": {
                  help: "List of headername:value pairs. If and only if the header is already set, replace its old value with the new one. Ignored if the header is not already set."
                },
                "querystring": {
                  help: "List of queryname:value pairs. If and only if the header is already set, replace its old value with the new one. Ignored if the header is not already set."
                },
                "body": {
                  help: "List of paramname:value pairs. If and only if content-type is one the following [application/json, multipart/form-data, application/x-www-form-urlencoded] and the parameter is already present, replace its old value with the new one. Ignored if the parameter is not already present."
                },
              },
              "add": {
                "headers": {
                  help: "List of headername:value pairs. If and only if the header is not already set, set a new header with the given value. Ignored if the header is already set."
                },
                "querystring": {
                  help: "List of queryname:value pairs. If and only if the querystring is not already set, set a new querystring with the given value. Ignored if the header is already set."
                },
                "body": {
                  help: "List of pramname:value pairs. If and only if content-type is one the following [application/json, multipart/form-data, application/x-www-form-urlencoded] and the parameter is not present, add a new parameter with the given value to form-encoded body. Ignored if the parameter is already present."
                },
              },
              "append": {
                "headers": {
                  help: "List of headername:value pairs. If the header is not set, set it with the given value. If it is already set, a new header with the same name and the new value will be set."
                },
                "querystring": {
                  help: "List of queryname:value pairs. If the querystring is not set, set it with the given value. If it is already set, a new querystring with the same name and the new value will be set."
                },
                "body": {
                  help: "List of paramname:value pairs. If the content-type is one the following [application/json, application/x-www-form-urlencoded], add a new parameter with the given value if the parameter is not present, otherwise if it is already present, the two values (old and new) will be aggregated in an array."
                }
              },
              "rename": {
                "headers": {
                  help: "List of headername:value pairs. If and only if the header is already set, rename the header. The value is unchanged. Ignored if the header is not already set."
                },
                "querystring": {
                  help: "List of queryname:value pairs. If and only if the field name is already set, rename the field name. The value is unchanged. Ignored if the field name is not already set."
                },
                "body": {
                  help: "List of parameter name:value pairs. Rename the parameter name if and only if content-type is one the following [application/json, multipart/form-data, application/x-www-form-urlencoded] and parameter is present."
                }
              },
            },

            "response-transformer": {
              meta: {
                description: 'Transform the response sent by the upstream server on the fly on Kong, before returning the response to the client.'
              },
              "remove": {
                "headers": {
                  help: "List of header names. Unset the header(s) with the given name."
                },
                "json": {
                  help: "List of property names. Remove the property from the JSON body if it is present."
                },
              },
              "replace": {
                "headers": {
                  help: "List of headername:value pairs. If and only if the header is already set, replace its old value with the new one. Ignored if the header is not already set."
                },
                "json": {
                  help: "List of property:value pairs. If and only if the parameter is already present, replace its old value with the new one. Ignored if the parameter is not already present."
                },
              },
              "add": {
                "headers": {
                  help: "List of headername:value pairs. If and only if the header is not already set, set a new header with the given value. Ignored if the header is already set."
                },
                "json": {
                  help: "List of property:value pairs. If and only if the property is not present, add a new property with the given value to the JSON body. Ignored if the property is already present."
                },
              },
              "append": {
                "headers": {
                  help: "List of headername:value pairs. If the header is not set, set it with the given value. If it is already set, a new header with the same name and the new value will be set."
                },
                "json": {
                  help: "List of property:value pairs. If the property is not present in the JSON body, add it with the given value. If it is already present, the two values (old and new) will be aggregated in an array."
                },
              },

            }
          }

          // Monkey patch to help with transition
          // of using plugin schema directly from kong
          var resp = plugin ? data[plugin] : data
          if (plugin && resp) {
            resp.fields = {
              meta: data[plugin] ? data[plugin].meta : {}
            }
          }


          return resp || {}
        }


        return KongPluginsService

      }
    ])
  ;
}());
