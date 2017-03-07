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

        it('throws "Missing request parameteres" when cant find the global user', () => {
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
            let anEntity = alicesEntity;
            givenUserWithAllowed(anAction, anEntity);

            // when
            return PermissionUtilities.validatePermissions(anAction, anEntity).then((result) => {
                // then
                expect(result).to.equal(true);
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

    });

    let anyAction = 'someAction';
    let anyEntity = 'someEntity';
    let alicesEntity = anyEntity;
    let alice = {
        acl: [{
            account: {
                id: '1'
            },
            role: {
                permissions: {
                    allow: [`${alicesEntity}/${anyAction}`]
                }
            }
        }]
    };

    function givenAnyUser() {
        setGlobalUser(alice);
        return alice;
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
                        denied: []
                    }
                }
            }]
        };
        setGlobalUser(user);

        return user;
    }

    function givenUserWithDenied(action, entity) {
        let user =  givenUserWithNoPermissions();
        user.acl[0].role.permissions.denied.push(`${entity}/${action}`);
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
