var _ = require('lodash');
var adminGroup = new RegExp(process.env.ADMIN_GROUP_REG || null);
var commonName = /^cn=([^,]+),.*/

var ldapToUser = function (ldapUser, next) {
    var data = {
        active: true
    }
    data.username = ldapUser.uid;
    data.firstName = ldapUser.givenName;
    data.lastName = ldapUser.sn;
    data.email = ldapUser.mail;

    sails.models.user.create(data)
        .exec(function (err, user) {
            if (err) {
                next(err);
            } else {
                setAdminStatus(ldapUser, user, next);
            }
        });
}

var group_test = function (group) {
    return group.cn === 'admin' || adminGroup.test(group.cn);
}

var member_test = function (group) {
     return group.startsWith('cn=admin') ||
         adminGroup.test(commonName.replace(group, "$1"));
}

var setAdminStatus = function (ldapUser, user, next) {
    user.admin =
        _.findIndex(ldapUser._groups, group_test) > -1 ||
        _.findIndex(ldapUser.memberOf, member_test) > -1;
    next(null, user);
}

/**
 * Resolve LDAP user
 *
 * This function can be used to create a user in the local db to store
 * users' roles locally
 *
 * @param {Request}   request
 * @param {Response}  response
 * @param {Function}  next
 */
exports.getResolver = function getResolver(next) {
    return function resolveUser(err, result, message) {
        if (result === false) {
            var error = message;
            next(error);
        } else {
            var ldapUser = result;
            sails.models.user
                .findOne({ // UID is the default, but the LDAP provider could be ActiveDirectory
                    username: (ldapUser.uid || ldapUser.sAMAccountName)
                })
                .populate('node')
                .exec(function onExec(error, user) {
                    if (error) {
                        // Dunno, something bad happened
                        next(error);
                    } else if (!user) {
                        // We've not seen this user yet, so let's create a profile
                        ldapToUser(ldapUser, next);
                    } else {
                        // We trust LDAP explicitly, so we'll check the groups the user
                        // is a part of evey time they login
                        setAdminStatus(ldapUser, user, next);
                    }
                })
        }
    };
}