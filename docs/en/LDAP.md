# LDAP

With the LDAP integration, you can authenticate via your LDAP server. Currently the application does need the user to be in the konga user database for the user profile page to display properly, so we currently will sync any LDAP authenticated user into the konga user database upon each login. In the future, perhaps the user profile page will be read-only for LDAP authentication? Or maybe it can sync the data back up to the LDAP server?

## Configuration

| Environment Variable | Default | Description |
| --- | --- | --- |
| `KONGA_AUTH_PROVIDER` | `local` | **Set this to `ldap` to switch auth provider to LDAP** |
| `KONGA_LDAP_HOST` | `ldap://localhost:389` | The location of the LDAP server |
| `KONGA_LDAP_BIND_DN` | *no default* | The DN that the konga should use to login to LDAP to search users |
| `KONGA_LDAP_BIND_PASSWORD` | *no default* | The password for the user konga will use to search for users |
| `KONGA_LDAP_USER_SEARCH_BASE` | `ou=users,dc=com` | The base DN used to search for users |
| `KONGA_LDAP_USER_SEARCH_FILTER` | `(\|(uid={{username}})(sAMAccountName={{username}}))` | The filter expression used to search for users. Use `{{username}}` where you expect the username to be. |
| `KONGA_LDAP_USER_ATTRS` | `uid,uidNumber,givenName,sn,mail` | Comma separated list of attributes to pull from the LDAP server for users |
| `KONGA_LDAP_GROUP_SEARCH_BASE` | `ou=groups,dc=com` | The base DN used to search for groups |
| `KONGA_LDAP_GROUP_SEARCH_FILTER` | `(\|(memberUid={{uid}})(memberUid={{uidNumber}})(sAMAccountName={{uid}}))` | The filter expression used to search for groups. Use `{{some-attr}}` where you expect a user attribute to be or `{{dn}}` for the user `dn`. |
| `KONGA_LDAP_GROUP_ATTRS` | `cn` | Comma separated list of attributes to pull from the LDAP server for groups |
| `KONGA_ADMIN_GROUP_REG` | `^(admin\|konga)$` | Regular expression used to determine if a group should be considered as an admin user |
| `KONGA_LDAP_ATTR_USERNAME` | `uid` | LDAP attribute name that should be used as the konga username |
| `KONGA_LDAP_ATTR_FIRSTNAME` | `givenName` | LDAP attribute name that should be used as the konga user's first name |
| `KONGA_LDAP_ATTR_LASTNAME` | `sn` | LDAP attribute name that should be used as the konga user's last name |
| `KONGA_LDAP_ATTR_EMAIL` | `mail` | LDAP attribute name that should be used as the konga user's email address |

