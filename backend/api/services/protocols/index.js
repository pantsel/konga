'use strict';

/**
 * Authentication Protocols
 *
 * Protocols where introduced to patch all the little inconsistencies between
 * the different authentication APIs. While the local authentication strategy
 * is as straight-forward as it gets, there are some differences between the
 * services that expose an API for authentication.
 *
 * For example, OAuth 1.0 and OAuth 2.0 both handle delegated authentication
 * using tokens, but the tokens have changed between the two versions. This
 * is accommodated by having a single `token` object in the Passport model that
 * can contain any combination of tokens issued by the authentication API.
 */
module.exports = {
  local: require('./local'),
  oauth: require('./oauth'),
  oauth2: require('./oauth2'),
  openid: require('./openid')
};
