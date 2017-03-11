'use strict';

/**
 * OAuth 2.0 Authentication Protocol
 *
 * OAuth 2.0 is the successor to OAuth 1.0, and is designed to overcome
 * perceived shortcomings in the earlier version. The authentication flow is
 * essentially the same. The user is first redirected to the service provider
 * to authorize access. After authorization has been granted, the user is
 * redirected back to the application with a code that can be exchanged for an
 * access token. The application requesting access, known as a client, is
 * identified by an ID and secret.
 *
 * For more information on OAuth in Passport.js, check out:
 * http://passportjs.org/guide/oauth/
 *
 * @param {Request}   request
 * @param {string}    accessToken
 * @param {string}    refreshToken
 * @param {{}}        profile
 * @param {Function}  next
 */
module.exports = function oauth2(request, accessToken, refreshToken, profile, next) {
  var query = {
    identifier: profile.id,
    protocol: 'oauth2',
    tokens: {
      accessToken: accessToken
    }
  };

  if (refreshToken !== undefined) {
    query.tokens.refreshToken = refreshToken;
  }

  sails.services.passport.connect(request, query, profile, next);
};
