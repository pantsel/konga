'use strict';

/**
 * Passport Service
 *
 * A painless Passport.js service for your Sails app that is guaranteed to
 * Rock Your Socks™. It takes all the hassle out of setting up Passport.js by
 * encapsulating all the boring stuff in two functions:
 *
 *   passport.endpoint()
 *   passport.callback()
 *
 * The former sets up an endpoint (/auth/:provider) for redirecting a user to a
 * third-party provider for authentication, while the latter sets up a callback
 * endpoint (/auth/:provider/callback) for receiving the response from the
 * third-party provider. All you have to do is define in the configuration which
 * third-party providers you'd like to support. It's that easy!
 *
 * Behind the scenes, the service stores all the data it needs within "Passports".
 * These contain all the information required to associate a local user with a
 * profile from a third-party provider. This even holds true for the good ol'
 * password authentication scheme – the Authentication Service takes care of
 * encrypting passwords and storing them in Passports, allowing you to keep your
 * User model free of bloat.
 */

// Module dependencies
var LdapStrategy = require('passport-ldapauth');
var ldapConf = require("../../config/ldap");
var passport = require('passport');
var path = require('path');
var url = require('url');
var _ = require('lodash');

// Load authentication protocols
passport.protocols = require('./protocols');

/**
 * Connect a third-party profile to a local user
 *
 * This is where most of the magic happens when a user is authenticating with a
 * third-party provider. What it does, is the following:
 *
 *   1. Given a provider and an identifier, find a matching Passport.
 *   2. From here, the logic branches into two paths.
 *
 *     - A user is not currently logged in:
 *       1. If a Passport wasn't found, just return 401
 *       2. If a Passport was found, get the user associated with the passport.
 *
 *     - A user is currently logged in:
 *       1. If a Passport wasn't found, just return 401
 *       2. If a Passport was found, nothing needs to happen.
 *
 * As you can see, this function handles both "authentication" and "authori-
 * zation" at the same time. This is due to the fact that we pass in
 * `passReqToCallback: true` when loading the strategies, allowing us to look
 * for an existing session in the request and taking action based on that.
 *
 * For more information on auth(entication|rization) in Passport.js, check out:
 * http://passportjs.org/guide/authenticate/
 * http://passportjs.org/guide/authorize/
 *
 * @param {Request}   request
 * @param {*}         query
 * @param {{}}        profile
 * @param {Function}  next
 */
passport.connect = function connect(request, query, profile, next) {
  sails.log.verbose(__filename + ':' + __line + ' [Service.Passport.connect() called]');

  var user = {};

  // Set the authentication provider.
  query.provider = request.param('provider');

  // If the profile object contains a list of emails, grab the first one and add it to the user.
  if (profile.hasOwnProperty('emails')) {
    user.email = profile.emails[0].value;
  }

  // If the profile object contains a username, add it to the user.
  if (profile.hasOwnProperty('username')) {
    user.username = profile.username;
  }

  /**
   * If neither an email or a username was available in the profile, we don't
   * have a way of identifying the user in the future. Throw an error and let
   * whoever is next in the line take care of it.
   */
  if (!Object.keys(user).length) {
    next(new Error('Neither a username or email was available', null));
  } else {
    sails.models.passport
      .findOne({
        provider: profile.provider,
        identifier: query.identifier.toString()
      })
      .exec(function callback(error, passport) {
        if (error) {
          next(error);
        } else if (!request.user) {
          if (!passport) {
            // Scenario: A new user is attempting to sign up using a third-party authentication provider.
            // Action:   Create a new user and assign them a passport.

            next("user not found")
          } else {
            // Scenario: An existing user is trying to log in using an already connected passport.
            // Action:   Get the user associated with the passport.

            // If the tokens have changed since the last session, update them
            if (query.hasOwnProperty('tokens') && query.tokens !== passport.tokens) {
              passport.tokens = query.tokens;
            }

            // Save any updates to the Passport before moving on
            passport
              .save(function callback(error, passport) {
                if (error) {
                  next(error);
                } else {
                  // Fetch the user associated with the Passport
                  sails.models.user.findOne(passport.user, next);
                }
              });
          }
        } else {
          // Scenario: A user is currently logged in and trying to connect a new passport.
          // Action:   Create and assign a new passport to the user.
          if (!passport) {
            query.user = request.user.id;

            sails.models.passport
              .create(query)
              .exec(function callback(error) {
                // If a passport wasn't created, bail out
                if (error) {
                  next(error);
                } else {
                  next(error, request.user);
                }
              });
          } else {
            // Scenario: The user is a nutjob or spammed the back-button.
            // Action:   Simply pass along the already established session.
            next(null, request.user);
          }
        }
      });
  }
};

/**
 * Create an authentication endpoint
 *
 * For more information on authentication in Passport.js, check out:
 * http://passportjs.org/guide/authenticate/
 *
 * @param {Request}   request
 * @param {Response}  response
 */
passport.endpoint = function endpoint(request, response) {
  sails.log.verbose(__filename + ':' + __line + ' [Service.Passport.endpoint() called]');

  var strategies = sails.config.passport;
  var provider = request.param('provider');
  var options = {};

  // If a provider doesn't exist for this endpoint, send the user back to the login page
  if (!strategies.hasOwnProperty(provider)) {
    response.json(401, 'Unknown auth provider');
  } else {
    // Attach scope if it has been set in the config
    if (strategies[provider].hasOwnProperty('scope')) {
      options.scope = strategies[provider].scope;
    }

    // Load authentication strategies
    this.loadStrategies(request);

    // Redirect the user to the provider for authentication. When complete,
    // the provider will redirect the user back to the application at
    //     /auth/:provider/callback
    this.authenticate(provider, options)(request, response, request.next);
  }
};

/**
 * Create an authentication callback endpoint
 *
 * For more information on authentication in Passport.js, check out:
 * http://passportjs.org/guide/authenticate/
 *
 * @param {Request}   request
 * @param {Response}  response
 * @param {Function}  next
 */
passport.callback = function callback(request, response, next) {
  sails.log.verbose(__filename + ':' + __line + ' [Service.Passport.callback() called]');

  var provider = request.param('provider', process.env.KONGA_AUTH_PROVIDER  || 'local');
  var action = request.param('action');

  if (provider === 'ldap') {
    passport.use(new LdapStrategy(ldapConf));
    this.authenticate('ldapauth',
      this.protocols.ldap.getResolver(next))(request, response, response.next);
  } else if (provider === 'local' && action !== undefined) {
    if (action === 'connect' && request.user) {
      this.protocols.local.connect(request, response, next);
    } else {
      next(new Error('Invalid action'));
    }
  } else {
    // Load authentication strategies
    this.loadStrategies(request);

    // The provider will redirect the user to this URL after approval. Finish
    // the authentication process by attempting to obtain an access token. If
    // access was granted, the user will be logged in. Otherwise, authentication
    // has failed.
    this.authenticate(provider, next)(request, response, request.next);
  }
};

/**
 * Load all strategies defined in the Passport configuration
 *
 * For example, we could add this to our config to use the GitHub strategy
 * with permission to access a users email address (even if it's marked as
 * private) as well as permission to add and update a user's Gists:
 *
 github: {
      name: 'GitHub',
      protocol: 'oauth2',
      scope: [ 'user', 'gist' ]
      options: {
        clientID: 'CLIENT_ID',
        clientSecret: 'CLIENT_SECRET'
      }
    }
 *
 * For more information on the providers supported by Passport.js, check out:
 * http://passportjs.org/guide/providers/
 *
 * @param {Request} request
 */
passport.loadStrategies = function loadStrategies(request) {
  sails.log.verbose(__filename + ':' + __line + ' [Service.Passport.loadStrategies() called]');

  var self = this;
  var strategies = sails.config.passport;

  Object.keys(strategies).forEach(function(key) {
    var options = {passReqToCallback: true};
    var Strategy;

    if (key === 'local') {
      /**
       * Since we need to allow users to login using both usernames as well as
       * emails, we'll set the username field to something more generic.
       */
      _.extend(options, {usernameField: 'identifier'});

      // Only load the local strategy if it's enabled in the config
      if (strategies.local) {
        Strategy = strategies[key].strategy;

        self.use(new Strategy(options, self.protocols.local.login));
      }
    } else {
      var protocol = strategies[key].protocol;
      var callback = strategies[key].callback;

      if (!callback) {
        callback = path.join('auth', key, 'callback');
      }

      Strategy = strategies[key].strategy;

      var baseUrl = sails.getBaseurl();

      switch (protocol) {
        case 'oauth':
        case 'oauth2':
          options.callbackURL = url.resolve(baseUrl, callback);
          break;
        case 'openid':
          options.returnURL = url.resolve(baseUrl, callback);
          options.realm = baseUrl;
          options.profile = true;
          break;
      }

      /**
       * Merge the default options with any options defined in the config. All
       * defaults can be overridden, but I don't see a reason why you'd want to
       * do that.
       */
      _.extend(options, strategies[key].options);

      self.use(new Strategy(options, self.protocols[protocol]));
    }
  });
};

passport.serializeUser(function serializeUser(user, next) {
  sails.log.verbose(__filename + ':' + __line + ' [Service.Passport.serializeUser() called]');

  if (!user) {
    next({message: 'Invalid user.'}, null);
  } else {
    next(null, user.id);
  }
});

passport.deserializeUser(function deserializeUser(id, next) {
  sails.log.verbose(__filename + ':' + __line + ' [Service.Passport.deserializeUser() called]');

  sails.models['user'].findOne(id, next);
});

module.exports = passport;
