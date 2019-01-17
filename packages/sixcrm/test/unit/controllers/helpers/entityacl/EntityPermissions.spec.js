

let chai = require('chai');
let expect = chai.expect;
let PermissionTestGenerators = global.SixCRM.routes.include('test', 'unit/lib/permission-test-generators');
const EntityPermissionsHelper = global.SixCRM.routes.include('helpers', 'entityacl/EntityPermissions.js');

describe('helpers/EntityPermissions.js', () => {
	describe('isShared', () => {
		let account, user;

		before(() => {
			account = '31aa3495-372f-4461-baa7-2f1c80c92176';
			user = PermissionTestGenerators.givenAnyUser(account).id;
		});

		it('returns true if not denied', () => {
			const acl = {
				allow: [],
				deny: []
			};

			expect(EntityPermissionsHelper.isShared('read', acl)).to.be.true;
		});

		it('returns true if all of account allowed', () => {
			const acl = {
				allow: [`${account}/*`],
				deny: ['*']
			};

			expect(EntityPermissionsHelper.isShared('read', acl)).to.be.true;
		});

		it('returns true if user is allowed', () => {
			const acl = {
				allow: [`${account}/${user}/*`],
				deny: ['*']
			};

			expect(EntityPermissionsHelper.isShared('read', acl)).to.be.true;
		});

		it('returns true if action is allowed', () => {
			const acl = {
				allow: [`${account}/${user}/read`],
				deny: ['*']
			};

			expect(EntityPermissionsHelper.isShared('read', acl)).to.be.true;
		});

		it('returns false if denied', () => {
			const acl = {
				allow: [],
				deny: ['*']
			};

			expect(EntityPermissionsHelper.isShared('read', acl)).to.be.false;
		});

		it('returns false for a different account', () => {
			const acl = {
				allow: [`wrong_account/${user}/read`],
				deny: ['*']
			};

			expect(EntityPermissionsHelper.isShared('read', acl)).to.be.false;
		});

		it('returns false for a different user', () => {
			const acl = {
				allow: [`${account}/wrong_user/read`],
				deny: ['*']
			};

			expect(EntityPermissionsHelper.isShared('read', acl)).to.be.false;
		});

		it('returns false if action is not allowed', () => {
			const acl = {
				allow: [`${account}/${user}/read`],
				deny: ['*']
			};

			expect(EntityPermissionsHelper.isShared('delete', acl)).to.be.false;
		});
	});
});
