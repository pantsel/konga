var _ = require('lodash');

var groupFilter = process.env.KONGA_LDAP_GROUP_SEARCH_FILTER || '(|(memberUid={{uid}})(memberUid={{uidNumber}})(sAMAccountName={{uid}}))';
var groupFilterTemplate = _.template(groupFilter, {
    // use {{...}} syntax for template variables
    interpolate: /{{([\s\S]+?)}}/g
});
module.exports = {
    server: {
        url: process.env.KONGA_LDAP_HOST || 'ldap://localhost:389',
        bindDN: process.env.KONGA_LDAP_BIND_DN,
        bindCredentials: process.env.KONGA_LDAP_BIND_PASSWORD,
        searchAttributes: (process.env.KONGA_LDAP_USER_ATTRS || 'uid,uidNumber,givenName,sn,mail').split(','),
        searchBase: process.env.KONGA_LDAP_USER_SEARCH_BASE || "ou=users,dc=com",
        searchFilter: process.env.KONGA_LDAP_USER_SEARCH_FILTER || '(|(uid={{username}})(sAMAccountName={{username}}))',
        groupSearchAttributes: (process.env.KONGA_LDAP_GROUP_ATTRS || 'cn').split(','),
        groupSearchBase: process.env.KONGA_LDAP_GROUP_SEARCH_BASE || 'ou=groups,dc=com',
        groupSearchFilter: function (user) {
            return groupFilterTemplate(user);
        }
    },
    usernameField: 'identifier',
    passwordField: 'password'
};
