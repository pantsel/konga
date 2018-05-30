
module.exports = {
    server: {
        url: process.env.LDAP_HOST || 'ldap://localhost:389',
        bindDN: process.env.LDAP_BIND_USER,
        bindCredentials: process.env.LDAP_BIND_PASSWORD,
        searchAttributes: ['uid', 'givenName', 'sn', 'mail'],
        searchBase: process.env.LDAP_SEARCH || "cn=users,dc=com",
        searchFilter: '(|(uid={{username}})(sAMAccountName={{username}}))',
        groupSearchAttributes: ['cn'],
        groupSearchBase: process.env.LDAP_GROUP_SEARCH || 'cn=groups,cn=accounts,dc=com',
        groupSearchFilter: '(member={{dn}})'
    },
    usernameField: 'identifier',
    passwordField: 'password'
};