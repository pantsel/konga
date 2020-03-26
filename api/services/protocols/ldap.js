var _ = require('lodash');
var adminGroup = new RegExp(process.env.KONGA_ADMIN_GROUP_REG || "^(admin|konga)$");
var ldapAttrMap = {
    username: process.env.KONGA_LDAP_ATTR_USERNAME || 'uid',
    firstName: process.env.KONGA_LDAP_ATTR_FIRSTNAME || 'givenName',
    lastName: process.env.KONGA_LDAP_ATTR_LASTNAME || 'sn',
    email: process.env.KONGA_LDAP_ATTR_EMAIL || 'mail'
};
var commonName = /^cn=([^,]+),.*/;

var ldapToUser = function (ldapUser, user, next) {
    var data = _.clone(user || {});
    
    data.admin =
        _.findIndex(ldapUser._groups, group_test) > -1 ||
        _.findIndex(ldapUser.memberOf, member_test) > -1;
    data.active = true;

    // copy attributes from the ldap user to the konga user using the ldapAttrMap
    for (var userAttr in ldapAttrMap) {
        if (ldapAttrMap.hasOwnProperty(userAttr)) {
            data[userAttr] = ldapUser[ldapAttrMap[userAttr]];
        }
    }

    if (data.id) {
        sails.models.user.update({id: data.id}, data).exec(function(err) {
            if (err) {
                console.error("Failed to update user from ldap", err);
                next(err);
            } else {
                next(null, data);
            }
        });
    } else {
        sails.models.user.create(data).exec(function (err, user) {
            if (err) {
                console.error("Failed to create user from ldap", err);
                next(err);
            } else {
                next(null, data);
            }
        });
    }
}

var group_test = function (group) {
    return adminGroup.test(group.cn);
}

var member_test = function (group) {
     return adminGroup.test(group.replace(commonName, "$1"));
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
        if (result === false || typeof result === 'undefined') {
            console.error('failed to resolve user', err, message);
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
                        console.error('failed to look up existing user', error);
                        next(error);
                    } else {
                        // sync the ldap user to konga user
                        ldapToUser(ldapUser, user, next);
                    }
                })
        }
    };
}
