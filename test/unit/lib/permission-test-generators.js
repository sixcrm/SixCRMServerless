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

    //Technical Debt: This is incorrect...
    static givenAnyUser() {
        let user = {
            id: 'super.user@test.com',
            acl: [{
                account: {
                    id: '770cf6af-42c4-4ffd-ba7f-9ee4fcb1084b'
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
