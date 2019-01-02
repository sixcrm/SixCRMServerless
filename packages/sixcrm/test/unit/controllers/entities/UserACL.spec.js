let chai = require('chai');
let expect = chai.expect;
const mockery = require('mockery');
const uuidV4 = require('uuid/v4');
let timestamp = require('@6crm/sixcrmcore/util/timestamp').default;
let PermissionTestGenerators = global.SixCRM.routes.include('test', 'unit/lib/permission-test-generators');
const MockEntities = global.SixCRM.routes.include('test', 'mock-entities.js');

function getValidUserACL() {
	return MockEntities.getValidUserACL()
}

function getValidAccount() {
	return MockEntities.getValidAccount()
}

function getValidRole() {
	return MockEntities.getValidRole()
}

describe('controllers/entities/UserACL.js', () => {

	before(() => {
		mockery.enable({
			useCleanCache: true,
			warnOnReplace: false,
			warnOnUnregistered: false
		});
	});

	beforeEach(() => {
		mockery.registerMock(global.SixCRM.routes.path('controllers', 'providers/dynamodb-provider.js'), class {});

		mockery.registerMock(global.SixCRM.routes.path('controllers', 'providers/sqs-provider.js'), class {
			sendMessage() {
				return Promise.resolve(true);
			}
		});
	});

	afterEach(() => {
		mockery.resetCache();
		mockery.deregisterAll();
	});

	after(() => {
		mockery.disable();
	});

	describe('getAccount', () => {

		it('retrieves an account based on user ACL id', () => {
			let userACL = getValidUserACL();

			let account = getValidAccount();

			mockery.registerMock(global.SixCRM.routes.path('controllers', 'entities/Account.js'), class {
				get(an_account) {
					expect(an_account.id).to.equal(userACL.account);
					return Promise.resolve(account);
				}
			});

			const UserACLController = global.SixCRM.routes.include('controllers','entities/UserACL.js');
			const userACLController = new UserACLController();

			return userACLController.getAccount(userACL).then((result) => {
				expect(result).to.deep.equal(account);
			});
		});
	});

	describe('getRole', () => {

		it('retrieves role based on user ACL id', () => {
			let userACL = getValidUserACL();

			let role = getValidRole();

			mockery.registerMock(global.SixCRM.routes.path('controllers', 'entities/Role.js'), class {
				getUnsharedOrShared(a_role) {
					expect(a_role.id).to.equal(userACL.role);
					return Promise.resolve(role);
				}
			});

			const UserACLController = global.SixCRM.routes.include('controllers','entities/UserACL.js');
			const userACLController = new UserACLController();

			return userACLController.getRole(userACL).then((result) => {
				expect(result).to.deep.equal(role);
			});
		});
	});

	describe('getPartiallyHydratedACLObject', () => {

		it('hydrates acl object by adding account and role data', () => {

			let userACL = getValidUserACL();

			let role = getValidRole();

			let account = getValidAccount();

			mockery.registerMock(global.SixCRM.routes.path('controllers', 'entities/Account.js'), class {
				get(an_account) {
					expect(an_account.id).to.equal(userACL.account);
					return Promise.resolve(account);
				}
			});

			mockery.registerMock(global.SixCRM.routes.path('controllers', 'entities/Role.js'), class {
				getUnsharedOrShared(a_role) {
					if(a_role.id == '78e507dd-93fc-413b-b21a-819480209740'){
						return Promise.resolve(disabled_role);
					}
					return Promise.resolve(role);
				}
			});

			const UserACLController = global.SixCRM.routes.include('controllers','entities/UserACL.js');
			const userACLController = new UserACLController();

			return userACLController.getPartiallyHydratedACLObject(userACL).then((result) => {
				expect(result.account).to.be.defined;
				expect(result.account).to.deep.equal(account);
				expect(result.role).to.be.defined;
				expect(result.role).to.deep.equal(role);
			});
		});

		it('hydrates acl object by adding account and role data (disabled account)', () => {

			let userACL = getValidUserACL();

			let role = getValidRole();
			let disabled_role = MockEntities.getDisabledRole();

			let account = getValidAccount();
			account.billing.deactivated_at = true;

			mockery.registerMock(global.SixCRM.routes.path('controllers', 'entities/Account.js'), class {
				get(an_account) {
					expect(an_account.id).to.equal(userACL.account);
					return Promise.resolve(account);
				}
			});

			mockery.registerMock(global.SixCRM.routes.path('controllers', 'entities/Role.js'), class {
				getUnsharedOrShared(a_role) {
					if(a_role.id == '78e507dd-93fc-413b-b21a-819480209740'){
						return Promise.resolve(disabled_role);
					}
					return Promise.resolve(role);
				}
			});

			const UserACLController = global.SixCRM.routes.include('controllers','entities/UserACL.js');
			const userACLController = new UserACLController();

			return userACLController.getPartiallyHydratedACLObject(userACL).then((result) => {
				expect(result.account).to.be.defined;
				expect(result.account).to.deep.equal(account);
				expect(result.role).to.be.defined;
			});
		});
	});

	describe('getACLByUser', () => {

		it('retrieve acl based on user', () => {

			let userACL = getValidUserACL();

			PermissionTestGenerators.givenUserWithAllowed('read', 'useracl');

			mockery.registerMock(global.SixCRM.routes.path('controllers', 'providers/dynamodb-provider.js'), class {
				queryRecords(table, parameters, index) {
					expect(parameters).to.have.property('key_condition_expression');
					expect(parameters).to.have.property('expression_attribute_values');
					expect(parameters).to.have.property('expression_attribute_names');
					expect(table).to.equal('useracls');
					expect(index).to.equal('user-index');
					return Promise.resolve({
						Count: 1,
						Items: [userACL]
					});
				}
			});

			const UserACLController = global.SixCRM.routes.include('controllers','entities/UserACL.js');
			const userACLController = new UserACLController();

			return userACLController.getACLByUser({user: 'dummy_user_data'}).then((result) => {
				expect(result).to.deep.equal({
					pagination: {
						count: 1,
						end_cursor: "",
						has_next_page: "false",
						last_evaluated: ""
					},
					useracls: [userACL]});
			});
		});
	});

	describe('getUser', () => {

		it('retrieves user data', () => {

			let userACL = getValidUserACL();

			mockery.registerMock(global.SixCRM.routes.path('controllers', 'entities/User.js'), class {
				get({id}) {
					expect(id).to.equal(userACL.user);
					return Promise.resolve('dummy_user_data');
				}
			});

			const UserACLController = global.SixCRM.routes.include('controllers','entities/UserACL.js');
			const userACLController = new UserACLController();

			return userACLController.getUser(userACL).then((result) => {
				expect(result).to.equal('dummy_user_data');
			});
		});

		it('returns partial user data', () => {

			let userACL = getValidUserACL();

			mockery.registerMock(global.SixCRM.routes.path('controllers', 'entities/User.js'), class {
				get({id}) {
					expect(id).to.equal(userACL.user);
					return Promise.resolve();
				}
			});

			const UserACLController = global.SixCRM.routes.include('controllers','entities/UserACL.js');
			const userACLController = new UserACLController();

			return userACLController.getUser(userACL).then((result) => {
				expect(result).to.deep.equal({
					id: userACL.user,
					name: userACL.user
				});
			});
		});
	});

	describe('getACLByAccount', () => {

		it('retrieves acl by account', () => {

			let userACL = getValidUserACL();

			PermissionTestGenerators.givenUserWithAllowed('read', 'useracl');

			mockery.registerMock(global.SixCRM.routes.path('controllers', 'providers/dynamodb-provider.js'), class {
				queryRecords(table, parameters, index) {
					expect(table).to.equal('useracls');
					expect(parameters).to.have.property('key_condition_expression');
					expect(parameters).to.have.property('expression_attribute_values');
					expect(parameters).to.have.property('expression_attribute_names');
					expect(index).to.equal('account-index');
					return Promise.resolve({ Items: [{useracl: userACL}] });
				}
			});

			const UserACLController = global.SixCRM.routes.include('controllers','entities/UserACL.js');
			const userACLController = new UserACLController();

			return userACLController.getACLByAccount({account: getValidAccount()}).then((result) => {
				expect(result[0].useracl).to.deep.equal(userACL);
			});
		});
	});

	describe('create', () => {

		it('successfully creates acl', () => {

			let params = {
				entity:
                    {
                    	user: 'dummyuser@example.test',
                    	role: 'aaaaaaaa-aaaa-4aaa-aaaa-aaaaaaaaaaaa'
                    },
				primary_key: 'id'
			};

			PermissionTestGenerators.givenUserWithAllowed('create', 'useracl');

			mockery.registerMock(global.SixCRM.routes.path('controllers', 'providers/dynamodb-provider.js'), class {
				queryRecords() {
					return Promise.resolve([]);
				}
				saveRecord(tableName, entity) {
					return Promise.resolve(entity);
				}
			});

			let mock_preindexing_helper = class {
				constructor(){

				}
			};

			mockery.registerMock(global.SixCRM.routes.path('helpers', 'indexing/PreIndexing.js'), mock_preindexing_helper);

			mockery.registerMock(global.SixCRM.routes.path('helpers', 'analytics/Activity.js'), class {
				createActivity() {
					return Promise.resolve();
				}
			});

			mockery.registerMock(global.SixCRM.routes.path('controllers', 'providers/notification/Notification.js'), class {
				createNotificationForAccountAndUser() {
					return Promise.resolve({});
				}
			});

			const UserACLController = global.SixCRM.routes.include('controllers','entities/UserACL.js');
			const userACLController = new UserACLController();

			return userACLController.create(params).then((result) => {
				expect(result.role).to.equal(params.entity.role);
				expect(result.user).to.equal(params.entity.user);
				expect(result.created_at).to.equal(result.updated_at);
			});
		});
	});

	describe('update', () => {

		it('successfully updates acl', () => {

			let params = {
				entity:
                    {
                    	id: uuidV4(),
                    	user: 'dummyuser@example.test',
                    	role: 'aaaaaaaa-aaaa-4aaa-aaaa-aaaaaaaaaaaa',
                    	created_at: '2017-12-25T15:00:21.430Z',
                    	updated_at: '2017-12-25T15:00:21.430Z'
                    },
				primary_key: 'id'
			};

			PermissionTestGenerators.givenUserWithAllowed('update', 'useracl');

			mockery.registerMock(global.SixCRM.routes.path('controllers', 'providers/dynamodb-provider.js'), class {
				queryRecords() {
					return Promise.resolve({Items: [params.entity]});
				}
				saveRecord(tableName, entity) {
					return Promise.resolve(entity);
				}
			});

			let mock_preindexing_helper = class {
				constructor(){

				}
			};

			mockery.registerMock(global.SixCRM.routes.path('helpers', 'indexing/PreIndexing.js'), mock_preindexing_helper);

			mockery.registerMock(global.SixCRM.routes.path('helpers', 'analytics/Activity.js'), class {
				createActivity() {
					return Promise.resolve();
				}
			});

			mockery.registerMock(global.SixCRM.routes.path('controllers', 'providers/notification/Notification.js'), class {
				createNotificationForAccountAndUser() {
					return Promise.resolve({});
				}
			});

			const UserACLController = global.SixCRM.routes.include('controllers','entities/UserACL.js');
			const userACLController = new UserACLController();

			return userACLController.update(params).then((result) => {
				expect(result.id).to.equal(params.entity.id);
				expect(result.role).to.equal(params.entity.role);
				expect(result.user).to.equal(params.entity.user);
				expect(result.created_at).not.to.equal(result.updated_at);
			});
		});
	});
});
