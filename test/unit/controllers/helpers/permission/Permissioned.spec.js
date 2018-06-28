
const mockery = require('mockery');
let chai = require('chai');
let expect = chai.expect;

//const eu = require('@6crm/sixcrmcore/util/error-utilities').default;
//const du = require('@6crm/sixcrmcore/util/debug-utilities').default;

const PermissionTestGenerators = global.SixCRM.routes.include('test', 'unit/lib/permission-test-generators');


describe('controllers/helpers/permission/Permissioned.js', () => {

	before(() => {
		mockery.enable({
			useCleanCache: true,
			warnOnReplace: false,
			warnOnUnregistered: false
		});
	});

	beforeEach(() => {
		mockery.registerMock(global.SixCRM.routes.path('controllers', 'providers/dynamodb-provider.js'), class {});
	});

	afterEach(() => {
		mockery.resetCache();
		mockery.deregisterAll();
	});

	describe('can', () => {

		afterEach(() => {
			delete global.user;
		});

		it('fails when user is not defined', async () => {

			let some_action = 'action_x';
			let some_object = 'object_y'
			const PermissionedController = global.SixCRM.routes.include('controllers','entities/Entity');
			let permissionedController = new PermissionedController('entity');

			try{

				await permissionedController.can({action: some_action, object: some_object});

			}catch(error){

				expect(error.message).to.equal('[500] Global is missing the user property.');

			}


		});

		it('fails when user is denied for action', async () => {

			let some_action = 'action_x';
			let some_object = 'object_y'

			PermissionTestGenerators.givenUserWithDenied(some_action, some_object);
			const PermissionedController = global.SixCRM.routes.include('controllers','entities/Entity');
			let permissionedController = new PermissionedController('entity');

			try {

				await permissionedController.can({action: some_action, object: some_object});

			}catch(error){

				expect(error.message).to.equal('[500] Unexpected ACL object structure:  Empty role.permission.allow object.');

			}

		});

		it('fails when user is not allowed for action', async () => {

			let some_action = 'action_x';
			let some_object = 'object_y';

			PermissionTestGenerators.givenUserWithNoPermissions();
			const PermissionedController = global.SixCRM.routes.include('controllers','entities/Entity');
			let permissionedController = new PermissionedController('entity');

			try {
				await permissionedController.can({action: some_action, object: some_object});
			}catch(error){
				expect(error.message).to.equal('[500] Unexpected ACL object structure:  Empty role.permission.allow object.');
			}

		});

		it('succeeds when user is allowed for action', () => {

			let some_action = 'action_x';
			let some_object = 'object_y';

			PermissionTestGenerators.givenUserWithAllowed(some_action, some_object);
			const PermissionedController = global.SixCRM.routes.include('controllers','entities/Entity');
			let permissionedController = new PermissionedController('entity');

			return permissionedController.can({action: some_action, object: some_object}).then((can) => {

				expect(can).to.equal(true);

			});

		});

	});

	describe('disableACLs/enableACLs', () => {

		afterEach(() => {
			delete global.user;
			global.disableactionchecks = false;
			global.disableaccountfilter = false;
		});

		it('successfully disables the acls', () => {

			const PermissionedController = global.SixCRM.routes.include('controllers','entities/Entity');
			let permissionedController = new PermissionedController('entity');
			permissionedController.disableACLs();
			expect(global.disableactionchecks).to.equal(true);
			expect(global.disableaccountfilter).to.equal(true);

		});

		it('successfully disables and then enables the acls', () => {

			const PermissionedController = global.SixCRM.routes.include('controllers','entities/Entity');
			let permissionedController = new PermissionedController('entity');
			permissionedController.disableACLs();
			expect(global.disableactionchecks).to.equal(true);
			expect(global.disableaccountfilter).to.equal(true);
			permissionedController.enableACLs();
			expect(global.disableactionchecks).to.equal(false);
			expect(global.disableaccountfilter).to.equal(false);

		});

	});

	describe('setGlobalUser/unsetGlobalUser', () => {

		afterEach(() => {
			delete global.user;
		});

		it('successfully sets/unsets a user object', () => {

			let user = {id: 'some@testuser.com'}

			const PermissionedController = global.SixCRM.routes.include('controllers','entities/Entity');
			let permissionedController = new PermissionedController('entity');
			permissionedController.setGlobalUser(user);
			expect(global.user).to.deep.equal(user);
			permissionedController.unsetGlobalUser();
			expect(global.user).to.not.be.defined;

		});

		it('successfully sets/unsets a user email', () => {

			let user = 'some@testuser.com';

			const PermissionedController = global.SixCRM.routes.include('controllers','entities/Entity');
			let permissionedController = new PermissionedController('entity');
			permissionedController.setGlobalUser(user);
			expect(global.user).to.equal(user);
			permissionedController.unsetGlobalUser();
			expect(global.user).to.not.be.defined;

		});

	});

});
