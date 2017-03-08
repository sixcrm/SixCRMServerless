let PermissionUtilities = require('../../../lib/permission-utilities');
let chai = require('chai');
let expect = chai.expect;

describe('lib/permission-utilities', () => {

    beforeEach(() => {
        process.env.SIX_VERBOSE = 0; // increase this for debug messages
        global.disableactionchecks = false;
    });

    describe('validatePermissions', () => {
        it('returns true when checks are disabled', () => {
            // given
            global.disableactionchecks = true;
            givenAnyUser();

            // when
            return PermissionUtilities.validatePermissions(anyAction, anyEntity).then((result) => {
                // then
                expect(result).to.equal(true);
            });
        });

        it('throws "Missing request parameteres" when can\'t find the global user', () => {
            // given
            delete global.user;
            delete global.account;

            // when
            return PermissionUtilities.validatePermissions(anyAction, anyEntity).then((result) => {
                // then
                expect(result).to.equal(false);
            }).catch(error => {
                expect(error.message).to.equal('Missing request parameters');
            });
        });

        it('returns true for universal permissions', () => {
            // given
            givenAnyUser();

            // when
            return PermissionUtilities.validatePermissions('read', 'role').then((result) => {
                // then
                expect(result).to.equal(true);
            });
        });

        it('returns true when user has permissions over entity', () => {
            // given
            let anAction = anyAction;
            let anEntity = anyEntity;
            givenUserWithAllowed(anAction, anEntity);

            // when
            return PermissionUtilities.validatePermissions(anAction, anEntity).then((result) => {
                // then
                expect(result).to.equal(true);
            });
        });

        it('returns true when user has permissions over entity and the id matches with \'*\'', () => {
            // given
            let user = givenAnyUser();
            user.acl[0].account.id = '*';

            // when
            return PermissionUtilities.validatePermissions(anyAction, anyEntity).then((result) => {
                // then
                expect(result).to.equal(true);
            });
        });

        it('returns true when user has asterisk permission over entity', () => {
            // given
            let user = givenUserWithNoPermissions();
            user.acl[0].role.permissions.allow.push(`${anyEntity}/*`);
            setGlobalUser(user);

            // when
            return PermissionUtilities.validatePermissions(anyAction, anyEntity).then((result) => {
                // then
                expect(result).to.equal(true);
            });
        });

        it('returns true when user has asterisk permission without entity', () => {
            // given
            let user = givenUserWithNoPermissions();
            user.acl[0].role.permissions.allow.push('*');
            setGlobalUser(user);

            // when
            return PermissionUtilities.validatePermissions(anyAction, anyEntity).then((result) => {
                // then
                expect(result).to.equal(true);
            });
        });

        it('returns false when user has invalid permission over entity (too many parts)', () => {
            // given
            let user = givenUserWithNoPermissions();
            user.acl[0].role.permissions.allow.push(`${anyEntity}/${anyAction}/somethingInvalid`);
            setGlobalUser(user);

            // when
            return PermissionUtilities.validatePermissions(anyAction, anyEntity).then((result) => {
                // then
                expect(result).to.equal(false);
            });
        });

        it('returns false when user has invalid permission over entity (without action)', () => {
            // given
            let user = givenUserWithNoPermissions();
            user.acl[0].role.permissions.allow.push(`${anyEntity}`);
            setGlobalUser(user);

            // when
            return PermissionUtilities.validatePermissions(anyAction, anyEntity).then((result) => {
                // then
                expect(result).to.equal(false);
            });
        });

        it('returns false when user has invalid permission over entity (without action but with separator)', () => {
            // given
            let user = givenUserWithNoPermissions();
            user.acl[0].role.permissions.allow.push(`${anyEntity}/`);
            setGlobalUser(user);

            // when
            return PermissionUtilities.validatePermissions(anyAction, anyEntity).then((result) => {
                // then
                expect(result).to.equal(false);
            });
        });

        it('returns false when user has no permissions over entity and the id matches with \'*\'', () => {
            // given
            let user = givenUserWithNoPermissions();
            user.acl[0].account.id = '*';

            // when
            return PermissionUtilities.validatePermissions(anyAction, anyEntity).then((result) => {
                // then
                expect(result).to.equal(false);
            });
        });

        it('returns false when user has no permissions over entity', () => {
            // given
            let anAction = anyAction;
            let anEntity = anyEntity;
            givenUserWithNoPermissions();

            // when
            return PermissionUtilities.validatePermissions(anAction, anEntity).then((result) => {
                // then
                expect(result).to.equal(false);
            });
        });

        it('returns false when user has been denied permissions over entity', () => {
            // given
            let anAction = anyAction;
            let anEntity = anyEntity;
            givenUserWithDenied(anAction, anEntity);

            // when
            return PermissionUtilities.validatePermissions(anAction, anEntity).then((result) => {
                // then
                expect(result).to.equal(false);
            });
        });

        it('returns false when user and account id does not match', () => {
            // given
            givenAnyUser();
            global.account += '2';

            // when
            return PermissionUtilities.validatePermissions(anyAction, anyEntity).then((result) => {
                // then
                expect(result).to.equal(false);
            });
        });

        it('throws error when the ACL structure is missing role object', () => {
            // given
            let user = givenAnyUser();
            delete user.acl[0].role;
            setGlobalUser(user);

            // when
            return PermissionUtilities.validatePermissions(anyAction, anyEntity).then((result) => {
                // then
                expect(result).to.equal(false);
            }).catch(error => {
                expect(error.message).to.equal('Unexpected ACL object structure');
            });
        });

        it('throws error when the ACL structure is missing permissions object', () => {
            // given
            let user = givenAnyUser();
            delete user.acl[0].role.permissions;
            setGlobalUser(user);

            // when
            return PermissionUtilities.validatePermissions(anyAction, anyEntity).then((result) => {
                // then
                expect(result).to.equal(false);
            }).catch(error => {
                expect(error.message).to.equal('Unexpected ACL object structure');
            });
        });

        it('throws error when the ACL structure is missing allow object', () => {
            // given
            let user = givenAnyUser();
            delete user.acl[0].role.permissions.allow;
            setGlobalUser(user);

            // when
            return PermissionUtilities.validatePermissions(anyAction, anyEntity).then((result) => {
                // then
                expect(result).to.equal(false);
            }).catch(error => {
                expect(error.message).to.equal('Unexpected ACL object structure');
            });
        });

        it('throws error when the ACL account id is missing', () => {
            // given
            let user = givenAnyUser();
            delete user.acl[0].account.id;
            setGlobalUser(user);

            // when
            return PermissionUtilities.validatePermissions(anyAction, anyEntity).then((result) => {
                // then
                expect(result).to.equal(false);
            }).catch(error => {
                expect(error.message).to.equal('Unset ACL Account');
            });
        });
    });

    describe('buildPermissionString', () => {
        it('builds permission string from action and entity', () => {
            // given
            let action = anyAction;
            let entity = anyEntity;

            // then
            expect(PermissionUtilities.buildPermissionString(action, entity)).to.equal(`${entity}/${action}`);
        });

        it('builds permission string from empty action and entity', () => {
            // given
            let action = '';
            let entity = anyEntity;

            // then
            expect(PermissionUtilities.buildPermissionString(action, entity)).to.equal(`${entity}/${action}`);
        });

        it('builds permission string from action and empty entity', () => {
            // given
            let action = anyAction;
            let entity = '';

            // then
            expect(PermissionUtilities.buildPermissionString(action, entity)).to.equal(`${entity}/${action}`);
        });

        it('builds permission string from empty action and empty entity', () => {
            // given
            let action = '';
            let entity = '';

            // then
            expect(PermissionUtilities.buildPermissionString(action, entity)).to.equal(`${entity}/${action}`);
        });
    });

    describe('hasPermission', () => {
        it('returns true when permission is in array', () => {
            // given
            let string = anyPermission;
            let array = [string];

            // then
            expect(PermissionUtilities.hasPermission(string, array)).to.equal(true);
        });

        it('returns true when permission is in array and array has multiple permissions', () => {
            // given
            let string = anyPermission;
            let array = [anyPermission, anotherPermission];

            // then
            expect(PermissionUtilities.hasPermission(string, array)).to.equal(true);
        });

        it('returns true when permission is a universal permission even if it\'s not in array', () => {
            // given
            let universal_permission = 'role/read';
            let array = [];

            // then
            expect(PermissionUtilities.hasPermission(universal_permission, array)).to.equal(true);
        });

        it('returns true when permission is a universal permission and is in array', () => {
            // given
            let universal_permission = 'role/read';
            let array = [universal_permission];

            // then
            expect(PermissionUtilities.hasPermission(universal_permission, array)).to.equal(true);
        });

        it('returns true when action is an asterisk', () => {
            // given
            let string = 'entity/someAction';
            let array = ['entity/*'];

            // then
            expect(PermissionUtilities.hasPermission(string, array)).to.equal(true);
        });

        it('returns true when permission is an asterisk', () => {
            // given
            let string = anyPermission;
            let array = ['*'];

            // then
            expect(PermissionUtilities.hasPermission(string, array)).to.equal(true);
        });

        it('returns true when array contains both asterisk and given permission', () => {
            // given
            let string = anyPermission;
            let array = ['*', anyPermission];

            // then
            expect(PermissionUtilities.hasPermission(string, array)).to.equal(true);
        });

        it('returns false when permission is not in array', () => {
            // given
            let string = anyPermission;
            let array = [];

            // then
            expect(PermissionUtilities.hasPermission(string, array)).to.equal(false);
        });

        it('returns false when permission string is empty', () => {
            // given
            let string = '';
            let array = [anyPermission];

            // then
            expect(PermissionUtilities.hasPermission(string, array)).to.equal(false);
        });

        it('returns false when permissions are for different entity', () => {
            // given
            let string = 'entity1/add';
            let array = ['entity2/add', 'entity3/read'];

            // then
            expect(PermissionUtilities.hasPermission(string, array)).to.equal(false);
        });

    });

    describe('buildPermissionObject', () => {
        it('allows user with specific permission', () => {
            // given
            let user = givenUserWithAllowed('add', 'user');

            // then
            expect(PermissionUtilities.buildPermissionObject()).to.deep.equal({
                allow: ['user/add'],
                deny: ['*']
            });
        });

        it('allows user with anothe id when account id is \'*\'', () => {
            // given
            let user = givenUserWithAllowed('add', 'user');
            user.acl[0].account.id = '*';
            setGlobalUser(user);
            global.account = 'anotherId';

            // then
            expect(PermissionUtilities.buildPermissionObject()).to.deep.equal({
                allow: ['user/add'],
                deny: ['*']
            });
        });

        it('denies user without specific permission', () => {
            // given
            let user = givenUserWithNoPermissions();

            // then
            expect(PermissionUtilities.buildPermissionObject()).to.deep.equal({
                allow: [],
                deny: ['*']
            });
        });

        it('denies when user and account don\'t match', () => {
            // given
            let user = givenUserWithAllowed('user', 'add');
            global.account = 'anotherId';

            // then
            expect(PermissionUtilities.buildPermissionObject()).to.deep.equal({
                allow: [],
                deny: ['*']
            });
        });

        it('denies all even if user is denied a specific permission', () => {
            // given
            let user = givenUserWithDenied('add', 'user');

            // then
            expect(PermissionUtilities.buildPermissionObject()).to.deep.equal({
                allow: [],
                deny: ['*']
            });
        });

        it('throws error when the ACL structure is missing role object', () => {
            // given
            givenAnyUser();
            delete global.user.acl[0].role;

            // when
            try {
                PermissionUtilities.buildPermissionObject();
            } catch(error) {
                // then
                expect(error.message).to.equal('Unexpected ACL object structure');
            }
        });

        it('throws error when the ACL structure is missing permissions object', () => {
            // given
            givenAnyUser();
            delete global.user.acl[0].role.permissions;

            // when
            try {
                PermissionUtilities.buildPermissionObject();
            } catch(error) {
                // then
                expect(error.message).to.equal('Unexpected ACL object structure');
            }
        });

        it('throws error when the ACL structure is missing allow object', () => {
            // given
            givenAnyUser();
            delete global.user.acl[0].role.allow;

            // when
            try {
                PermissionUtilities.buildPermissionObject();
            } catch(error) {
                // then
                expect(error.message).to.equal('Unexpected ACL object structure');
            }
        });

        it('throws error when the ACL account is missing', () => {
            // given
            givenAnyUser();
            delete global.user.acl[0].account.id;

            // when
            try {
                PermissionUtilities.buildPermissionObject();
            } catch(error) {
                // then
                expect(error.message).to.equal('Unset ACL Account');
            }
        });
    });

    describe('getPermissions', () => {
        it('throws error when global user is missing', () => {
            // given
            givenAnyUser();
            delete global.user;

            // when
            return PermissionUtilities.getPermissions().then().catch(error => {
                expect(error.message).to.equal('Missing request parameters');
            });
        });

        it('throws error when global user is null', () => {
            // given
            givenAnyUser();
            global.user = null;

            // when
            return PermissionUtilities.getPermissions().then().catch(error => {
                expect(error.message).to.equal('Missing request parameters');
            });
        });

        it('throws error when global account is missing', () => {
            // given
            givenAnyUser();
            delete global.account;

            // when
            return PermissionUtilities.getPermissions().then().catch(error => {
                expect(error.message).to.equal('Missing request parameters');
            });
        });

        it('throws error when global user is null', () => {
            // given
            givenAnyUser();
            delete global.account;

            // when
            return PermissionUtilities.getPermissions().then().catch(error => {
                expect(error.message).to.equal('Missing request parameters');
            });
        });

        it('resolves permission object otherwise', () => {
            // given
            let user = givenAnyUser();

            // when
            return PermissionUtilities.getPermissions().then(result => {
                expect(result).to.be.defined;
            });
        });
    });

    let anyAction = 'someAction';
    let anyEntity = 'someEntity';
    let anyPermission = `${anyEntity}/${anyAction}`;
    let anotherPermission = `${anyEntity}1/${anyAction}1`;

    function givenAnyUser() {
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
        setGlobalUser(user);
        return user;
    }

    function setGlobalUser(user) {
        global.user = user;
        global.account = user.acl[0].account.id;
    }

    function givenUserWithNoPermissions() {
        user = {
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
        setGlobalUser(user);

        return user;
    }

    function givenUserWithDenied(action, entity) {
        let user =  givenUserWithNoPermissions();
        user.acl[0].role.permissions.deny.push(`${entity}/${action}`);
        setGlobalUser(user);

        return user;
    }

    function givenUserWithAllowed(action, entity) {
        let user =  givenUserWithNoPermissions();
        user.acl[0].role.permissions.allow.push(`${entity}/${action}`);
        setGlobalUser(user);

        return user;
    }

});
