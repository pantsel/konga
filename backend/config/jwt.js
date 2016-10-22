'use strict';

module.exports = {
  jwt: {
    secret: '8fe171f3-0046-4df5-9216-14099434339f',
    sign: {
      algorithm: 'HS512',
      expiresInMinutes: 1,
      noTimestamp: false
    },
    verify: {
      ignoreExpiration: false
    }
  }
};
