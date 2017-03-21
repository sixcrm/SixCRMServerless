const anyAction = 'someAction';
const anyEntity = 'someEntity';
const anyPermission = `${anyEntity}/${anyAction}`;
const anotherPermission = `${anyEntity}1/${anyAction}1`;

class PermissionTestGenerators {

    static anyAction() {
        return anyAction;
    }

    static anyEntity() {
        return anyEntity;
    }

    static anyPermission() {
        return anyPermission;
    }

    static anotherPermission() {
        return anotherPermission;
    }

    static givenAnyUser() {
        let user = {
            acl: [{
                account: {
                    id: '1'
                },
                role: {
                    permissions: {
                        allow: [`${anyEntity}/${anyAction}`]
                    }
                }
            }]
        };
        PermissionTestGenerators.setGlobalUser(user);
        return user;
    }

    static setGlobalUser(user) {
        global.user = user;
        global.account = user.acl[0].account.id;
    }

    static givenUserWithNoPermissions() {
        let user = {
            acl: [{
                account: {
                    id: '1'
                },
                role: {
                    permissions: {
                        allow: [],
                        deny: []
                    }
                }
            }]
        };
        PermissionTestGenerators.setGlobalUser(user);

        return user;
    }

    static givenUserWithDenied(action, entity) {
        let user = PermissionTestGenerators.givenUserWithNoPermissions();
        user.acl[0].role.permissions.deny.push(`${entity}/${action}`);
        PermissionTestGenerators.setGlobalUser(user);

        return user;
    }

    static givenUserWithAllowed(action, entity) {
        let user = PermissionTestGenerators.givenUserWithNoPermissions();
        user.acl[0].role.permissions.allow.push(`${entity}/${action}`);
        PermissionTestGenerators.setGlobalUser(user);

        return user;
    }
}

module.exports = PermissionTestGenerators;