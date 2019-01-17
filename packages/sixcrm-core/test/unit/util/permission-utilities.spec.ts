import PermissionUtilities from '../../../src/util/permission-utilities';
import PermissionTestGenerators from './permission-test-generators';
import * as chai from 'chai';
const expect = chai.expect;

describe('lib/permission-utilities', () => {

	beforeEach(() => {
		global.disableactionchecks = false;
	});

	afterEach(() => {
		// global.SixCRM.localcache.clear('all');
	});

	const anyAction = PermissionTestGenerators.anyAction();
	const anyEntity = PermissionTestGenerators.anyEntity();
	const anyPermission = PermissionTestGenerators.anyPermission();
	const anotherPermission = PermissionTestGenerators.anotherPermission();

	describe('validatePermissions', () => {
		it('returns true when checks are disabled', () => {
			// given
			global.disableactionchecks = true;
			PermissionTestGenerators.givenAnyUser();

			const result = PermissionUtilities.validatePermissions(anyAction, anyEntity);

			expect(result).to.equal(true);

		});

		it('throws "Missing request parameteres" when can\'t find the global user', () => {
			// given
			delete global.user;
			delete global.account;

			try {

				PermissionUtilities.validatePermissions(anyAction, anyEntity);

			} catch (error) {

				expect(error.message).to.equal('[500] Global is missing the user property.');

			}

		});

		it('returns true for universal permissions', () => {

			PermissionTestGenerators.givenAnyUser();

			const result = PermissionUtilities.validatePermissions('read', 'role');

			expect(result).to.equal(true);

		});

		it('returns true when user has permissions over entity', () => {
			// given
			const anAction = anyAction;
			const anEntity = anyEntity;

			PermissionTestGenerators.givenUserWithAllowed(anAction, anEntity);

			const result = PermissionUtilities.validatePermissions(anAction, anEntity);

			expect(result).to.equal(true);

		});

		it('returns true when user has permissions over entity and the id matches with \'*\'', () => {
			// given
			const user = PermissionTestGenerators.givenAnyUser();

			user.acl[0].account.id = '*';

			// when
			const result = PermissionUtilities.validatePermissions(anyAction, anyEntity);
			// then

			expect(result).to.equal(true);

		});

		it('returns true when user has asterisk permission over entity', () => {
			// given
			const user = PermissionTestGenerators.givenUserWithNoPermissions();

			user.acl[0].role.permissions.allow.push(`${anyEntity}/*`);
			PermissionTestGenerators.setGlobalUser(user);

			// when
			const result = PermissionUtilities.validatePermissions(anyAction, anyEntity);
			// then

			expect(result).to.equal(true);

		});

		it('returns true when user has asterisk permission without entity', () => {
			// given
			const user = PermissionTestGenerators.givenUserWithNoPermissions();

			user.acl[0].role.permissions.allow.push('*');
			PermissionTestGenerators.setGlobalUser(user);

			// when
			const result = PermissionUtilities.validatePermissions(anyAction, anyEntity);
			// then

			expect(result).to.equal(true);

		});
		/* Note: No longer true
    it('returns false when user has invalid permission over entity (too many parts)', () => {
        // given
        let user = PermissionTestGenerators.givenUserWithNoPermissions();

        user.acl[0].role.permissions.allow.push(`${anyEntity}/${anyAction}/somethingInvalid/somethingElseInvalid`);
        PermissionTestGenerators.setGlobalUser(user);

        // when
        return PermissionUtilities.validatePermissions(anyAction, anyEntity).then((result) => {
            // then
            expect(result).to.equal(true);
        });
    });

    it('returns false when user has invalid permission over entity (without action)', () => {
        // given
        let user = PermissionTestGenerators.givenUserWithNoPermissions();

        user.acl[0].role.permissions.allow.push(`${anyEntity}`);
        PermissionTestGenerators.setGlobalUser(user);

        // when
        return PermissionUtilities.validatePermissions(anyAction, anyEntity).then((result) => {
            // then
            expect(result).to.equal(false);
        });
    });

    it('returns false when user has invalid permission over entity (without action but with separator)', () => {
        // given
        let user = PermissionTestGenerators.givenUserWithNoPermissions();

        user.acl[0].role.permissions.allow.push(`${anyEntity}/`);
        PermissionTestGenerators.setGlobalUser(user);

        // when
        return PermissionUtilities.validatePermissions(anyAction, anyEntity).then((result) => {
            // then
            expect(result).to.equal(false);
        });
    });
    */
		it('returns false when user has no permissions over entity and the id matches with \'*\'', () => {
			// given
			const user = PermissionTestGenerators.givenUserWithNoPermissions();

			user.acl[0].account.id = '*';

			// when
			const result = PermissionUtilities.validatePermissions(anyAction, anyEntity);
			// then

			expect(result).to.equal(false);

		});

		it('returns false when user has no permissions over entity', () => {
			// given
			const anAction = anyAction;
			const anEntity = anyEntity;

			PermissionTestGenerators.givenUserWithNoPermissions();

			// when
			const result = PermissionUtilities.validatePermissions(anAction, anEntity);
			// then

			expect(result).to.equal(false);

		});

		it('returns false when user has been denied permissions over entity', () => {
			// given
			const anAction = anyAction;
			const anEntity = anyEntity;

			PermissionTestGenerators.givenUserWithDenied(anAction, anEntity);

			// when
			const result = PermissionUtilities.validatePermissions(anAction, anEntity);
			// then

			expect(result).to.equal(false);

		});

		it('returns false when user and account id does not match', () => {
			// given
			PermissionTestGenerators.givenAnyUser();
			global.account += '2';

			// when
			const result = PermissionUtilities.validatePermissions(anyAction, anyEntity);
			// then

			expect(result).to.equal(false);

		});

		it('throws error when the ACL structure is missing role object', () => {
			// given
			const user = PermissionTestGenerators.givenAnyUser();

			delete user.acl[0].role;
			PermissionTestGenerators.setGlobalUser(user);

			try {

				PermissionUtilities.validatePermissions(anyAction, anyEntity);

			} catch (error) {

				expect(error.message).to.equal('[500] Unexpected ACL object structure');

			}

		});

		it('throws error when the ACL structure is missing permissions object', () => {
			// given
			const user = PermissionTestGenerators.givenAnyUser();

			delete user.acl[0].role.permissions;
			PermissionTestGenerators.setGlobalUser(user);

			try {

				PermissionUtilities.validatePermissions(anyAction, anyEntity);

			} catch (error) {

				expect(error.message).to.equal('[500] Unexpected ACL object structure');

			}

		});

		it('throws error when the ACL structure is missing allow object', () => {
			// given
			const user = PermissionTestGenerators.givenAnyUser();

			delete user.acl[0].role.permissions.allow;
			PermissionTestGenerators.setGlobalUser(user);

			try {

				PermissionUtilities.validatePermissions(anyAction, anyEntity);

			} catch (error) {

				expect(error.message).to.equal('[500] Unexpected ACL object structure');

			}

		});

		it('throws error when the ACL account id is missing', () => {
			// given
			const user = PermissionTestGenerators.givenAnyUser();

			delete user.acl[0].account.id;
			PermissionTestGenerators.setGlobalUser(user);

			// when
			try {

				PermissionUtilities.validatePermissions(anyAction, anyEntity);

			} catch (error) {

				expect(error.message).to.equal('[500] Unset ACL Account');

			}
			// then

		});
	});

	describe('buildPermissionString', () => {
		it('builds permission string from action and entity', () => {
			// given
			const action = anyAction;
			const entity = anyEntity;

			// then
			expect(PermissionUtilities.buildPermissionString(action, entity)).to.equal(`${entity}/${action}/*`);
		});

		it('builds permission string from empty action and entity', () => {
			// given
			const action = '';
			const entity = anyEntity;

			// then
			try {
				expect(PermissionUtilities.buildPermissionString(action, entity));
			} catch (error) {
				expect(error.message).to.equal('[500] Empty string');
			}
		});

		it('builds permission string from action and empty entity', () => {
			// given
			const action = anyAction;
			const entity = '';

			// then
			try {
				expect(PermissionUtilities.buildPermissionString(action, entity));
			} catch (error) {
				expect(error.message).to.equal('[500] Empty string');
			}

		});

		it('builds permission string from empty action and empty entity', () => {
			// given
			const action = '';
			const entity = '';

			// then
			try {
				expect(PermissionUtilities.buildPermissionString(action, entity));
			} catch (error) {
				expect(error.message).to.equal('[500] Empty string');
			}
		});
	});

	describe('hasPermission', () => {
		it('returns true when permission is in array', () => {
			// given
			const string = anyPermission;
			const array = [string];

			// then
			expect(PermissionUtilities.hasPermission(string, array)).to.equal(true);
		});

		it('returns true when permission is in array and array has multiple permissions', () => {
			// given
			const string = anyPermission;
			const array = [anyPermission, anotherPermission];

			// then
			expect(PermissionUtilities.hasPermission(string, array)).to.equal(true);
		});

		it('returns true when permission is a universal permission even if it\'s not in array', () => {
			// given
			const universal_permission = 'role/read';
			const array = [];

			// then
			expect(PermissionUtilities.hasPermission(universal_permission, array)).to.equal(true);

		});

		it('returns true when permission is a universal permission and is in array', () => {
			// given
			const universal_permission = 'role/read';
			const array = [universal_permission];

			// then
			expect(PermissionUtilities.hasPermission(universal_permission, array)).to.equal(true);
		});

		it('returns true when action is an asterisk', () => {
			// given
			const string = 'entity/someAction';
			const array = ['entity/*'];

			// then
			expect(PermissionUtilities.hasPermission(string, array)).to.equal(true);
		});

		it('returns true when permission is an asterisk', () => {
			// given
			const string = anyPermission;
			const array = ['*'];

			// then
			expect(PermissionUtilities.hasPermission(string, array)).to.equal(true);
		});

		it('returns true when array contains both asterisk and given permission', () => {
			// given
			const string = anyPermission;
			const array = ['*', anyPermission];

			// then
			expect(PermissionUtilities.hasPermission(string, array)).to.equal(true);
		});

		it('returns false when permission is not in array', () => {
			// given
			const string = anyPermission;
			const array = [];

			// then
			expect(PermissionUtilities.hasPermission(string, array)).to.equal(false);
		});

		it('returns false when permission string is empty', () => {
			// given
			const string = '';
			const array = [anyPermission];

			// then
			expect(PermissionUtilities.hasPermission(string, array)).to.equal(false);
		});

		it('returns false when permissions are for different entity', () => {
			// given
			const string = 'entity1/add';
			const array = ['entity2/add', 'entity3/read'];

			// then
			expect(PermissionUtilities.hasPermission(string, array)).to.equal(false);
		});

	});

	describe('buildPermissionObject', () => {
		it('allows user with specific permission', () => {
			// given
			PermissionTestGenerators.givenUserWithAllowed('add', 'user');

			// then
			expect(PermissionUtilities.buildPermissionObject()).to.deep.equal({
				allow: ['user/add'],
				deny: ['*']
			});
		});

		it('allows user with anothe id when account id is \'*\'', () => {
			// given
			const user = PermissionTestGenerators.givenUserWithAllowed('add', 'user');

			user.acl[0].account.id = '*';
			PermissionTestGenerators.setGlobalUser(user);
			global.account = 'anotherId';

			// then
			expect(PermissionUtilities.buildPermissionObject()).to.deep.equal({
				allow: ['user/add'],
				deny: ['*']
			});
		});

		it('denies user without specific permission', () => {
			// given
			PermissionTestGenerators.givenUserWithNoPermissions();

			// then
			expect(PermissionUtilities.buildPermissionObject()).to.deep.equal({
				allow: [],
				deny: ['*']
			});
		});

		it('denies when user and account don\'t match', () => {
			// given
			PermissionTestGenerators.givenUserWithAllowed('user', 'add');

			global.account = 'anotherId';

			// then
			expect(PermissionUtilities.buildPermissionObject()).to.deep.equal({
				allow: [],
				deny: ['*']
			});
		});

		it('denies all even if user is denied a specific permission', () => {
			// given
			PermissionTestGenerators.givenUserWithDenied('add', 'user');

			// then
			expect(PermissionUtilities.buildPermissionObject()).to.deep.equal({
				allow: [],
				deny: ['*']
			});
		});

		it('throws error when the ACL structure is missing role object', () => {
			// given
			PermissionTestGenerators.givenAnyUser();
			delete global.user.acl[0].role;

			// when
			try {
				PermissionUtilities.buildPermissionObject();
			} catch (error) {
				// then
				expect(error.message).to.equal('[500] Unexpected ACL object structure');
			}
		});

		it('throws error when the ACL structure is missing permissions object', () => {
			// given
			PermissionTestGenerators.givenAnyUser();
			delete global.user.acl[0].role.permissions;

			// when
			try {
				PermissionUtilities.buildPermissionObject();
			} catch (error) {
				// then
				expect(error.message).to.equal('[500] Unexpected ACL object structure');
			}
		});

		it('throws error when the ACL structure is missing allow object', () => {
			// given
			PermissionTestGenerators.givenAnyUser();
			delete global.user.acl[0].role.allow;

			// when
			try {
				PermissionUtilities.buildPermissionObject();
			} catch (error) {
				// then
				expect(error.message).to.equal('[500] Unexpected ACL object structure');
			}
		});

		it('throws error when the ACL account is missing', () => {
			// given
			PermissionTestGenerators.givenAnyUser();
			delete global.user.acl[0].account.id;

			// when
			try {

				PermissionUtilities.buildPermissionObject();

			} catch (error) {
				// then
				expect(error.message).to.equal('[500] Unset ACL Account');

			}
		});
	});

	describe('getPermissions', () => {
		it('throws error when global user is missing', () => {
			// given
			PermissionTestGenerators.givenAnyUser();
			delete global.user;

			// when
			try {
				PermissionUtilities.getPermissions();
			} catch (error) {
				expect(error.message).to.equal('[500] Global is missing the user property.');
			}
		});

		it('throws error when global user is null', () => {
			// given
			PermissionTestGenerators.givenAnyUser();
			global.user = null;

			// when
			try {
				PermissionUtilities.getPermissions();
			} catch (error) {
				expect(error.message).to.equal('[500] Global is missing the user property.');
			}

		});

		it('throws error when global account is missing', () => {
			// given
			PermissionTestGenerators.givenAnyUser();
			delete global.account;

			// when
			try {
				PermissionUtilities.getPermissions();
			} catch (error) {
				expect(error.message).to.equal('[500] Global is missing the account property.');
			}

		});

		it('throws error when global account is null', () => {
			// given
			PermissionTestGenerators.givenAnyUser();
			global.account = null;

			// when
			try {
				PermissionUtilities.getPermissions();
			} catch (error) {
				expect(error.message).to.equal('[500] Global is missing the account property.');
			}

		});

		it('resolves permission object otherwise', () => {
			// given
			PermissionTestGenerators.givenAnyUser();

			// when
			const result = PermissionUtilities.getPermissions();

			expect(result).to.not.be.undefined;

		});
	});

	describe('validatePermissionsArray', () => {
		it('successfully validates permissions', () => {

			const permissions_array = [anyPermission, anotherPermission];

			PermissionTestGenerators.givenAnyUser();

			const result = PermissionUtilities.validatePermissionsArray(permissions_array);

			expect(result).to.not.be.undefined;
		});
	});

	describe('areACLsDisabled', () => {
		it('returns true when action checks and account filter are disabled', () => {
			global.disableactionchecks = true;
			global.disableaccountfilter = true;

			expect(PermissionUtilities.areACLsDisabled()).to.be.true;
		});
	});
});
