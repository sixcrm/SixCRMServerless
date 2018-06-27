let chai = require('chai');
let expect = chai.expect;
const mockery = require('mockery');
let PermissionTestGenerators = global.SixCRM.routes.include('test', 'unit/lib/permission-test-generators');
const timestamp = require('@6crm/sixcrmcore/util/timestamp').default;
const spoofer = global.SixCRM.routes.include('test','spoofer.js');
const MockEntities = global.SixCRM.routes.include('test', 'mock-entities.js');

function getValidUser() {
	return MockEntities.getValidUser()
}

function getValidUserACL() {
	return MockEntities.getValidUserACL()
}


describe('controllers/entities/User.js', () => {

	before(() => {
		mockery.enable({
			useCleanCache: true,
			warnOnReplace: false,
			warnOnUnregistered: false
		});
	});

	beforeEach(() => {
		mockery.registerMock(global.SixCRM.routes.path('controllers', 'providers/dynamodb-provider.js'), class {});

		mockery.registerMock(global.SixCRM.routes.path('controllers', 'providers/sns-provider.js'), class {
			publish() {
				return Promise.resolve({});
			}
			getRegion() {
				return 'localhost';
			}
		});

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

	describe('can', () => {

		it('returns true when action is allowed for specified user', () => {

			PermissionTestGenerators.givenUserWithAllowed('update', 'user');

			const UserController = global.SixCRM.routes.include('controllers', 'entities/User.js');
			const userController = new UserController();

			return userController.can({action: 'update', id: global.user.id}).then((result) => {
				expect(result).to.equal(true);
			});
		});
	});

	describe('getHydrated', () => {
		it('returns hydrated user', () => {
			let user = getValidUser();
			let acl = {};
			const UserController = global.SixCRM.routes.include('controllers', 'entities/User.js');
			const userController = new UserController();

			userController.get = () => Promise.resolve(user);
			userController.getACLPartiallyHydrated = () => Promise.resolve(acl);

			return userController.getHydrated(user.id)
				.then(result => {
					const expected = Object.assign({acl}, user);

					expect(result).to.deep.equal(expected);
				});
		});

		it('returns null if user not found', () => {
			let user = getValidUser();

			const UserController = global.SixCRM.routes.include('controllers', 'entities/User.js');
			const userController = new UserController();

			userController.get = () => Promise.resolve(null);

			return userController.getHydrated(user.id)
				.then(result => {
					expect(result).to.be.null;
				});
		});

		it('rejects with server error if hydration fails', () => {
			let user = getValidUser();
			const UserController = global.SixCRM.routes.include('controllers', 'entities/User.js');
			const userController = new UserController();

			userController.get = () => Promise.resolve(user);
			userController.getACLPartiallyHydrated = () => Promise.resolve({});
			userController.isPartiallyHydratedUser = () => Promise.resolve(false);
			return userController.getHydrated(user.id)
				.catch(error => {
					expect(error.message).to.equal('[500] The user is not partially hydrated.');
				});
		});
	});

	describe('getACLPartiallyHydrated', () => {
		it('resolves with a list of hydrated acls', () => {
			let user = getValidUser();
			let acls = [
				{id: 'fake-1'},
				{id: 'fake-2'}
			];

			mockery.registerMock(global.SixCRM.routes.path('controllers', 'entities/UserACL.js'), class {
				queryBySecondaryIndex({index_name, field, index_value}) {
					expect(index_name).to.equal('user-index');
					expect(field).to.equal('user');
					expect(index_value).to.equal(user.id);
					return Promise.resolve({
						useracls: acls,
						pagination: {}
					});
				}
				getPartiallyHydratedACLObject(acl) {
					acl.role = 'role';
					acl.account = 'account';
					return Promise.resolve(acl);
				}
			});

			const UserController = global.SixCRM.routes.include('controllers', 'entities/User.js');
			const userController = new UserController();

			return userController.getACLPartiallyHydrated(user).then(result => {
				expect(result).to.deep.equal([{
					id: 'fake-1',
					role: 'role',
					account: 'account'
				}, {
					id: 'fake-2',
					role: 'role',
					account: 'account'
				}]);
			});
		});

		it('returns null if no acls found', () => {
			let user = getValidUser();

			mockery.registerMock(global.SixCRM.routes.path('controllers', 'entities/UserACL.js'), class {
				queryBySecondaryIndex() {
					return Promise.resolve({
						useracls: [],
						pagination: {}
					});
				}
			});

			const UserController = global.SixCRM.routes.include('controllers', 'entities/User.js');
			const userController = new UserController();

			return userController.getACLPartiallyHydrated(user).then(result => {
				expect(result).to.be.null;
			});
		});
	});

	describe('getACL', () => {

		it('successfully retrieves user ACL by user id', () => {
			let user_without_acl = getValidUser(); //valid user without acl

			mockery.registerMock(global.SixCRM.routes.path('controllers','entities/UserACL.js'), class {
				getACLByUser({user}) {
					expect(user).to.equal(user_without_acl.id);
					return Promise.resolve({
						useracls: ['userACL']
					})
				}
			});

			const UserController = global.SixCRM.routes.include('controllers', 'entities/User.js');
			const userController = new UserController();

			return userController.getACL(user_without_acl).then((result) => {
				expect(result).to.deep.equal(['userACL']);
			});
		});

		it('successfully retrieves user ACL', () => {
			let user_data = getValidUser();

			user_data.acl = ['userACL'];

			const UserController = global.SixCRM.routes.include('controllers', 'entities/User.js');
			const userController = new UserController();

			expect(userController.getACL(user_data)).to.deep.equal(['userACL']);
		});
	});

	describe('getAccessKey', () => {

		it('successfully retrieves an access key', () => {
			let user = getValidUser();

			mockery.registerMock(global.SixCRM.routes.path('controllers','entities/AccessKey.js'), {
				get: ({id}) => {
					expect(id).to.equal(user.id);
					return Promise.resolve('an_access_key')
				}
			});

			const UserController = global.SixCRM.routes.include('controllers', 'entities/User.js');
			const userController = new UserController();

			return userController.getAccessKey(user.id).then((result) => {
				expect(result).to.equal('an_access_key');
			});
		});
	});

	describe('getAccount', () => {

		it('successfully retrieves a master account', () => {

			const UserController = global.SixCRM.routes.include('controllers', 'entities/User.js');
			const userController = new UserController();

			mockery.registerMock(global.SixCRM.routes.path('controllers','entities/Account.js'), {
				getMasterAccount: () => {
					return Promise.resolve({
						"id":"*",
						"name": "Master Account",
						"active": true
					});
				}
			});

			return userController.getAccount('*').then((result) => {
				expect(result).to.deep.equal({
					id: '*',
					name: 'Master Account',
					active: true
				});
			});
		});

		it('successfully retrieves an account', () => {

			mockery.registerMock(global.SixCRM.routes.path('controllers','entities/Account.js'), {
				get: ({id}) => {
					expect(id).to.equal('dummy_id');
					return Promise.resolve('an_account')
				}
			});

			const UserController = global.SixCRM.routes.include('controllers', 'entities/User.js');
			const userController = new UserController();

			return userController.getAccount('dummy_id').then((result) => {
				expect(result).to.equal('an_account');
			});
		});
	});

	describe('getAccessKeyByKey', () => {

		it('successfully retrieves an access key by key', () => {
			let user = getValidUser();

			mockery.registerMock(global.SixCRM.routes.path('controllers','entities/AccessKey.js'), {
				getAccessKeyByKey: ({id}) => {
					expect(id).to.equal(user.id);
					return Promise.resolve('an_access_key')
				}
			});

			const UserController = global.SixCRM.routes.include('controllers', 'entities/User.js');
			const userController = new UserController();

			return userController.getAccessKeyByKey(user.id).then((result) => {
				expect(result).to.equal('an_access_key');
			});
		});
	});

	describe('getUserByAccessKeyId', () => {

		it('successfully retrieves user by access key id', () => {
			let user = getValidUser();

			let mock_entity = class {
				constructor(){}

				getBySecondaryIndex({field, index_value, index_name}) {
					expect(field).to.equal('access_key_id');
					expect(index_value).to.equal('an_access_key_id');
					expect(index_name).to.equal('access_key_id-index');
					return Promise.resolve(user);
				}
			};

			mockery.registerMock(global.SixCRM.routes.path('controllers','entities/Entity.js'), mock_entity);

			const UserController = global.SixCRM.routes.include('controllers', 'entities/User.js');
			const userController = new UserController();

			return userController.getUserByAccessKeyId('an_access_key_id').then((result) => {
				expect(result).to.deep.equal(user);
			});
		});
	});

	describe('createStrict', () => {

		beforeEach(() => {
			mockery.registerMock(global.SixCRM.routes.path('analytics', 'Analytics.js'), class {
				disableACLs() {}
				enableACLs() {}
			});
		});

		it('successfully creates user strict', () => {

			let user = getValidUser();
			delete user.created_at;
			delete user.updated_at;

			PermissionTestGenerators.givenUserWithAllowed('create', 'user');
			user.id = global.user.id;

			mockery.registerMock(global.SixCRM.routes.path('entities', 'Entity.js'), class {
				constructor(){

				}
				create({entity}){
					entity.created_at = timestamp.getISO8601();
					entity.updated_at = entity.created_at;
					return Promise.resolve(entity);
				}
				disableACLs(){}
				enableACLs(){}
			});

			mockery.registerMock(global.SixCRM.routes.path('controllers', 'providers/dynamodb-provider.js'), class {
				queryRecords(table, parameters) {
					expect(table).to.equal('users');
					expect(parameters.expression_attribute_values[':primary_keyv']).to.equal(user.id);
					return Promise.resolve([]);
				}
				saveRecord(tableName, entity) {
					expect(tableName).to.equal('users');
					expect(entity).to.deep.equal(user);
					return Promise.resolve(entity);
				}
			});

			mockery.registerMock(global.SixCRM.routes.path('helpers', 'analytics/Activity.js'), class {
				createActivity() {
					return Promise.resolve();
				}
			});

			const UserController = global.SixCRM.routes.include('controllers', 'entities/User.js');
			const userController = new UserController();

			return userController.createStrict(user).then((result) => {
				expect(result).to.deep.equal(user);
			});

		});

		it('throws error when user strict is not created', () => {
			let user = getValidUser();

			PermissionTestGenerators.givenUserWithAllowed('create', 'user');

			user.id = global.user.id;

			mockery.registerMock(global.SixCRM.routes.path('entities', 'Entity.js'), class {
				constructor(){

				}
				create({entity}){
					return Promise.resolve(entity);
				}
				disableACLs(){}
				enableACLs(){}
			});

			mockery.registerMock(global.SixCRM.routes.path('controllers', 'providers/dynamodb-provider.js'), class {
				queryRecords(table, parameters) {
					expect(table).to.equal('users');
					expect(parameters.expression_attribute_values[':primary_keyv']).to.equal(user.id);
					return Promise.resolve([]);
				}
				saveRecord(tableName, entity) {
					expect(tableName).to.equal('users');
					expect(entity).to.deep.equal(user);
					return Promise.reject(new Error('Saving failed.'));
				}
			});

			const UserController = global.SixCRM.routes.include('controllers', 'entities/User.js');
			const userController = new UserController();

			return userController.createStrict(user).catch((error) => {
				expect(error.message).to.equal('Saving failed.');
			});
		});

		it('throws error when user id does not match global user id', () => {

			let user = getValidUser();

			const UserController = global.SixCRM.routes.include('controllers', 'entities/User.js');
			const userController = new UserController();

			try {
				userController.createStrict(user)
			}catch(error){
				expect(error.message).to.equal("[500] User ID does not match Global User ID");
			}
		});

		it('throws error when global user id is not set', () => {

			delete global.user.id;

			const UserController = global.SixCRM.routes.include('controllers', 'entities/User.js');
			const userController = new UserController();

			try {
				userController.createStrict()
			}catch(error){
				expect(error.message).to.equal("[500] Unset user in globals");
			}
		});
	});

	describe('assureUser', () => {

		it('returns user when user with specified id already exists', () => {

			let user = getValidUser();

			PermissionTestGenerators.givenUserWithAllowed('*', '*');

			mockery.registerMock(global.SixCRM.routes.path('entities', 'UserSetting.js'), class {
				constructor(){}
				create(){
					return Promise.resolve
				}
			});

			mockery.registerMock(global.SixCRM.routes.path('controllers', 'providers/dynamodb-provider.js'), class {
				queryRecords(table, parameters) {
					expect(table).to.equal('users');
					expect(parameters.expression_attribute_values[':primary_keyv']).to.equal(user.id);
					return Promise.resolve({
						Count: 1,
						Items: [user]
					});
				}
			});

			const UserController = global.SixCRM.routes.include('controllers', 'entities/User.js');
			const userController = new UserController();

			return userController.assureUser(user.id).then((result) => {
				expect(result).to.equal(user);
			});

		});

		it('successfully assures user', () => {

			let user = getValidUser();

			let alias;

			PermissionTestGenerators.givenUserWithAllowed('*', 'user');

			mockery.registerMock(global.SixCRM.routes.path('controllers', 'providers/dynamodb-provider.js'), class {
				queryRecords(table, parameters) {
					expect(table).to.equal('users');
					expect(parameters.expression_attribute_values[':primary_keyv']).to.equal(user.id);
					return Promise.resolve(user);
				}
				saveRecord(tableName, entity) {
					alias = entity.alias;
					expect(tableName).to.equal('users');
					expect(entity.id).to.equal(user.id);
					expect(entity.name).to.equal(user.id);
					expect(entity.first_name).to.equal(user.id);
					expect(entity.last_name).to.equal(user.id);
					expect(entity.active).to.equal(false);
					return Promise.resolve(entity);
				}
			});

			mockery.registerMock(global.SixCRM.routes.path('controllers', 'entities/UserSetting.js'), class {
				create({entity}) {
					expect(entity.id).to.equal(user.id);
					expect(entity.timezone).to.equal('America/Los_Angeles');
					expect(entity.notifications).to.deep.equal([
						{ name: 'six', receive: true },
						{ name: 'email', receive: false, data: entity.id },
						{ name: 'sms', receive: false },
						{ name: 'slack', receive: false },
						{ name: 'skype', receive: false },
						{ name: 'ios', receive: false }
					]);
					return Promise.resolve(user)
				}
			});

			const UserController = global.SixCRM.routes.include('controllers', 'entities/User.js');
			const userController = new UserController();

			return userController.assureUser(user.id).then((result) => {
				expect(result.active).to.equal(false);
				expect(result.alias).to.equal(alias);
				expect(result.id).to.equal(user.id);
				expect(result.name).to.equal(user.id);
				expect(result.first_name).to.equal(user.id);
				expect(result.last_name).to.equal(user.id);
			});
		});

		it('successfully assures user when user helper and user setting helper controllers are already set', () => {

			const UserHelperController = global.SixCRM.routes.include('helpers', 'entities/user/User.js');
			const UserSettingHelperController = global.SixCRM.routes.include('helpers', 'entities/usersetting/UserSetting.js');

			let user = getValidUser();

			let alias;

			PermissionTestGenerators.givenUserWithAllowed('*', 'user');

			mockery.registerMock(global.SixCRM.routes.path('controllers', 'providers/dynamodb-provider.js'), class {
				queryRecords(table, parameters) {
					expect(table).to.equal('users');
					expect(parameters.expression_attribute_values[':primary_keyv']).to.equal(user.id);
					return Promise.resolve(user);
				}
				saveRecord(tableName, entity) {
					alias = entity.alias;
					expect(tableName).to.equal('users');
					expect(entity.id).to.equal(user.id);
					expect(entity.name).to.equal(user.id);
					expect(entity.first_name).to.equal(user.id);
					expect(entity.last_name).to.equal(user.id);
					expect(entity.active).to.equal(false);
					return Promise.resolve(entity);
				}
			});

			mockery.registerMock(global.SixCRM.routes.path('controllers', 'entities/UserSetting.js'), class {
				create({entity}) {
					expect(entity.id).to.equal(user.id);
					expect(entity.timezone).to.equal('America/Los_Angeles');
					expect(entity.notifications).to.deep.equal([
						{ name: 'six', receive: true },
						{ name: 'email', receive: false, data: entity.id },
						{ name: 'sms', receive: false },
						{ name: 'slack', receive: false },
						{ name: 'skype', receive: false },
						{ name: 'ios', receive: false }
					]);
					return Promise.resolve(user)
				}
			});

			const UserController = global.SixCRM.routes.include('controllers', 'entities/User.js');
			const userController = new UserController();

			userController.userHelperController = new UserHelperController();
			userController.userSettingHelperController = new UserSettingHelperController();

			return userController.assureUser(user.id).then((result) => {
				expect(result.active).to.equal(false);
				expect(result.alias).to.equal(alias);
				expect(result.id).to.equal(user.id);
				expect(result.name).to.equal(user.id);
				expect(result.first_name).to.equal(user.id);
				expect(result.last_name).to.equal(user.id);
			});
		});

		it('throws error when user settings are not successfully created', () => {
			let user_id = 'test@example.com';

			PermissionTestGenerators.givenUserWithAllowed('*', 'user');

			mockery.registerMock(global.SixCRM.routes.path('entities', 'Entity.js'), class {
				constructor(){

				}
				create({entity}){
					return Promise.resolve(entity);
				}
				get(){
					return Promise.resolve(null);
				}
				executeAssociatedEntityFunction(){
					return Promise.resolve({});
				}
			});

			mockery.registerMock(global.SixCRM.routes.path('controllers', 'providers/dynamodb-provider.js'), class {
				queryRecords(table, parameters) {
					expect(table).to.equal('users');
					expect(parameters.expression_attribute_values[':primary_keyv']).to.equal(user_id);
					return Promise.resolve({});
				}
				saveRecord(tableName, entity) {
					expect(tableName).to.equal('users');
					expect(entity.id).to.equal(user_id);
					expect(entity.name).to.equal(user_id);
					expect(entity.termsandconditions).to.equal('0.0');
					expect(entity.active).to.equal(true);
					expect(entity.auth0id).to.equal('-');
					expect(entity.alias).to.equal('ccc8a2908e3b3722e73c727b01adae54c6e341eb');
					return Promise.resolve(entity);
				}
			});

			mockery.registerMock(global.SixCRM.routes.path('lib', 'random.js'), {
				createRandomString: () => {
					return 'a_random_string';
				}
			});

			mockery.registerMock(global.SixCRM.routes.path('controllers','entities/UserSetting.js'), class {
				create({entity}) {
					expect(entity.id).to.equal(user_id);
					expect(entity.timezone).to.equal('America/Los_Angeles');
					expect(entity.notifications).to.deep.equal([
						{ name: 'six', receive: true },
						{ name: 'email', receive: false },
						{ name: 'sms', receive: false },
						{ name: 'slack', receive: false },
						{ name: 'skype', receive: false },
						{ name: 'ios', receive: false }
					]);
					return Promise.reject(new Error('User settings creating failed.'));
				}
			});

			mockery.registerMock(global.SixCRM.routes.path('helpers', 'analytics/Activity.js'), class {
				createActivity() {
					return Promise.resolve();
				}
			});

			const UserController = global.SixCRM.routes.include('controllers', 'entities/User.js');
			const userController = new UserController();

			return userController.assureUser(user_id).catch((error) => {
				expect(error.message).to.equal('[500] Error: User settings creating failed.');
			});
		});

		it('throws error when user retrieving failed', () => {
			let user_id = 'test@example.com';

			PermissionTestGenerators.givenUserWithAllowed('*', 'user');

			mockery.registerMock(global.SixCRM.routes.path('controllers', 'providers/dynamodb-provider.js'), class {
				queryRecords(table, parameters) {
					expect(table).to.equal('users');
					expect(parameters.expression_attribute_values[':primary_keyv']).to.equal(user_id);
					return Promise.reject(new Error('User retrieving failed.'));
				}
			});

			const UserController = global.SixCRM.routes.include('controllers', 'entities/User.js');
			const userController = new UserController();

			return userController.assureUser(user_id).catch((error) => {
				expect(error.message).to.equal('[500] Error: User retrieving failed.');
			});
		});
	});

	describe('associatedEntitiesCheck', () => {

		it('creates associated entities object', () => {

			let user_id = getValidUser().id;

			let userACL = getValidUserACL();

			mockery.registerMock(global.SixCRM.routes.path('controllers','entities/UserACL.js'), class {
				listByUser({user}) {
					expect(user).to.equal(user_id);
					return Promise.resolve({
						useracls: [userACL]
					})
				}
			});

			const UserController = global.SixCRM.routes.include('controllers', 'entities/User.js');
			const userController = new UserController();

			return userController.associatedEntitiesCheck({id: user_id}).then((result) => {
				expect(result).to.deep.equal([{
					entity: {
						id: userACL.id
					},
					name: "Campaign"
				}]);
			});
		});

		it('returns an empty array when userACL with specified user id does not exist', () => {

			let user_id = getValidUser().id;

			mockery.registerMock(global.SixCRM.routes.path('controllers','entities/UserACL.js'), class {
				listByUser({user}) {
					expect(user).to.equal(user_id);
					return Promise.resolve({})
				}
			});

			const UserController = global.SixCRM.routes.include('controllers', 'entities/User.js');
			const userController = new UserController();

			return userController.associatedEntitiesCheck({id: user_id}).then((result) => {
				expect(result).to.deep.equal([]);
			});
		});
	});

	describe('getUserByAlias', () => {

		beforeEach(() => {
			mockery.registerMock(global.SixCRM.routes.path('analytics', 'Analytics.js'), class {
				disableACLs() {}
				enableACLs() {}
			});
		});

		it('retrieves user with acl by alias', () => {

			let user = getValidUser();

			let userACL = getValidUserACL();

			let partially_hydrated_userACL = {
				role: userACL.role,
				account: userACL.account
			};

			PermissionTestGenerators.givenUserWithAllowed('read', 'user');

			mockery.registerMock(global.SixCRM.routes.path('controllers','entities/UserACL.js'), class {
				queryBySecondaryIndex({index_name, field, index_value}) {
					expect(index_name).to.equal('user-index');
					expect(field).to.equal('user');
					expect(index_value).to.equal(user.id);
					return Promise.resolve({
						useracls: [userACL]
					})
				}
				getPartiallyHydratedACLObject() {
					return Promise.resolve(partially_hydrated_userACL)
				}
			});

			mockery.registerMock(global.SixCRM.routes.path('controllers', 'providers/dynamodb-provider.js'), class {
				queryRecords(table) {
					expect(table).to.equal('users');
					return Promise.resolve({
						Count: 1,
						Items: [user]
					});
				}
			});

			const UserController = global.SixCRM.routes.include('controllers', 'entities/User.js');
			const userController = new UserController();

			return userController.getUserByAlias(user.alias).then((result) => {
				expect(result.acl[0].role).to.equal(userACL.role);
				expect(result.acl[0].account).to.equal(userACL.account);
				expect(result).to.equal(user);
			});
		});

		it('returns false when user is not found', () => {

			let user = getValidUser();

			PermissionTestGenerators.givenUserWithAllowed('read', 'user');

			mockery.registerMock(global.SixCRM.routes.path('controllers', 'providers/dynamodb-provider.js'), class {
				queryRecords(table) {
					expect(table).to.equal('users');
					return Promise.resolve({});
				}
			});

			const UserController = global.SixCRM.routes.include('controllers', 'entities/User.js');
			const userController = new UserController();

			return userController.getUserByAlias(user.alias).then((result) => {
				expect(result).to.equal(false);
			});
		});

		it('throws internal server error when userACL query fails', () => {

			let user = getValidUser();

			PermissionTestGenerators.givenUserWithAllowed('read', 'user');

			mockery.registerMock(global.SixCRM.routes.path('controllers', 'providers/dynamodb-provider.js'), class {
				queryRecords(table) {
					expect(table).to.equal('users');
					return Promise.resolve({
						Count: 1,
						Items: [user]
					});
				}
			});

			mockery.registerMock(global.SixCRM.routes.path('controllers','entities/UserACL.js'), class {
				queryBySecondaryIndex({index_name, field, index_value}) {
					expect(index_name).to.equal('user-index');
					expect(field).to.equal('user');
					expect(index_value).to.equal(user.id);
					return new Error('Failed');
				}
			});

			const UserController = global.SixCRM.routes.include('controllers', 'entities/User.js');
			const userController = new UserController();

			return userController.getUserByAlias(user.alias).catch((error) => {
				expect(error.message).to.equal('[500] Internal Server Error');
			});
		});
	});

	describe('getUserStrict', () => {

		beforeEach(() => {
			mockery.registerMock(global.SixCRM.routes.path('analytics', 'Analytics.js'), class {
				disableACLs() {}
				enableACLs() {}
			});
		});

		it('successfully retrieves user strict and sets global user and user acl', () => {

			let user = getValidUser();

			let userACL = getValidUserACL();

			let email = spoofer.createRandomEmail();

			let partially_hydrated_userACL = {
				role: userACL.role,
				account: userACL.account
			};

			PermissionTestGenerators.givenUserWithAllowed('read', 'user');

			mockery.registerMock(global.SixCRM.routes.path('controllers', 'providers/dynamodb-provider.js'), class {
				queryRecords(table) {
					expect(table).to.equal('users');
					return Promise.resolve({
						Count: 1,
						Items: [user]
					});
				}
			});

			mockery.registerMock(global.SixCRM.routes.path('controllers','entities/UserACL.js'), class {
				queryBySecondaryIndex({index_name, field, index_value}) {
					expect(index_name).to.equal('user-index');
					expect(field).to.equal('user');
					expect(index_value).to.equal(user.id);
					return Promise.resolve({
						useracls: [userACL]
					})
				}
				getPartiallyHydratedACLObject() {
					return Promise.resolve(partially_hydrated_userACL)
				}
			});

			const UserController = global.SixCRM.routes.include('controllers', 'entities/User.js');
			const userController = new UserController();

			return userController.getUserStrict(email).then((result) => {
				expect(global.user).to.deep.equal(user);
				expect(global.user.acl).to.deep.equal([partially_hydrated_userACL]);
				expect(result).to.equal(user);
			});
		});

		it('returns false when user is not found', () => {

			let email = spoofer.createRandomEmail();

			PermissionTestGenerators.givenUserWithAllowed('read', 'user');

			mockery.registerMock(global.SixCRM.routes.path('controllers', 'providers/dynamodb-provider.js'), class {
				queryRecords(table) {
					expect(table).to.equal('users');
					return Promise.resolve({});
				}
			});

			const UserController = global.SixCRM.routes.include('controllers', 'entities/User.js');
			const userController = new UserController();

			return userController.getUserStrict(email).then((result) => {
				expect(result).to.equal(false);
			});
		});

		it('throws internal server error when userACL query fails', () => {

			let user = getValidUser();

			let email = spoofer.createRandomEmail();

			PermissionTestGenerators.givenUserWithAllowed('read', 'user');

			mockery.registerMock(global.SixCRM.routes.path('controllers', 'providers/dynamodb-provider.js'), class {
				queryRecords(table) {
					expect(table).to.equal('users');
					return Promise.resolve({
						Count: 1,
						Items: [user]
					});
				}
			});

			mockery.registerMock(global.SixCRM.routes.path('controllers','entities/UserACL.js'), class {
				queryBySecondaryIndex({index_name, field, index_value}) {
					expect(index_name).to.equal('user-index');
					expect(field).to.equal('user');
					expect(index_value).to.equal(user.id);
					return new Error('Failed');
				}
			});

			const UserController = global.SixCRM.routes.include('controllers', 'entities/User.js');
			const userController = new UserController();

			return userController.getUserStrict(email).catch((error) => {
				expect(error.message).to.equal('[500] Internal Server Error');
			});
		});

		it('throws error when email is incorrect', () => {

			let invalid_emails = ['any_string', '123', 'any_string123', 123, 123.123, [], {}, () => {}, true,
				'plainaddress',
				'#@%^%#$@#$@#.com',
				'@example.com',
				'email.example.com',
				'email@example@example.com',
				'.email@example.com',
				'email.@example.com',
				'email..email@example.com',
				'email@example',
				'email@-example.com',
				'email@example..com',
				'Abc..123@example.com'
			];

			const UserController = global.SixCRM.routes.include('controllers', 'entities/User.js');
			const userController = new UserController();

			invalid_emails.forEach(async email => {
				try {
					await userController.getUserStrict(email)
				}catch(error) {
					expect(error.message).to.equal('[400] A user identifier or a email is required, "' + email + '" provided');
				}
			})
		});
	});

	describe('getUsersByAccount', () => {

		it('successfully retrieves users by account', () => {

			let user = getValidUser();

			let userACL = getValidUserACL();

			let params = {
				pagination: {
					count: 1,
					end_cursor: '',
					has_next_page: 'false',
					last_evaluated: ''
				},
				fatal: false
			};

			PermissionTestGenerators.givenUserWithAllowed('read', 'user');

			mockery.registerMock(global.SixCRM.routes.path('controllers', 'providers/dynamodb-provider.js'), class {
				scanRecords(table) {
					expect(table).to.equal('users');
					return Promise.resolve({ Count:1, Items: [user] });
				}
				createINQueryParameters(field, in_array) {
					expect(field).to.equal('id');
					expect(in_array[0]).to.equal(userACL.user);
					return Promise.resolve({
						filter_expression: 'a_filter',
						expression_attribute_values: 'an_expression_values'
					})
				}
			});

			mockery.registerMock(global.SixCRM.routes.path('controllers','entities/UserACL.js'), class {
				getACLByAccount({account, fatal}) {
					expect(account).to.equal(global.account);
					expect(fatal).to.equal(params.fatal);
					return Promise.resolve([userACL]);
				}
			});

			const UserController = global.SixCRM.routes.include('controllers', 'entities/User.js');
			const userController = new UserController();

			return userController.getUsersByAccount(params).then((result) => {
				expect(result).to.deep.equal({
					pagination: params.pagination,
					users: [user]
				});
			});
		});

		it('returns null when there are no results for specified account', () => {

			let params = {
				pagination: {
					count: 1,
					end_cursor: '',
					has_next_page: 'false',
					last_evaluated: ''
				},
				fatal: false
			};

			PermissionTestGenerators.givenUserWithAllowed('read', 'user');

			mockery.registerMock(global.SixCRM.routes.path('controllers','entities/UserACL.js'), class {
				getACLByAccount({account, fatal}) {
					expect(account).to.equal(global.account);
					expect(fatal).to.equal(params.fatal);
					return Promise.resolve([]);
				}
			});

			const UserController = global.SixCRM.routes.include('controllers', 'entities/User.js');
			const userController = new UserController();

			return userController.getUsersByAccount(params).then((result) => {
				expect(result).to.equal(null);
			});
		});

		it('successfully retrieves users by account with master account permissions', () => {

			let user = getValidUser();

			let params = {
				pagination: {
					count: 1,
					end_cursor: '',
					has_next_page: 'false',
					last_evaluated: ''
				},
				fatal: false
			};

			PermissionTestGenerators.givenUserWithAllowed('*', '*', '*');

			mockery.registerMock(global.SixCRM.routes.path('controllers', 'providers/dynamodb-provider.js'), class {
				scanRecords(table) {
					expect(table).to.equal('users');
					return Promise.resolve({ Count:1, Items: [user] });
				}
			});

			const UserController = global.SixCRM.routes.include('controllers', 'entities/User.js');
			const userController = new UserController();

			return userController.getUsersByAccount(params).then((result) => {
				expect(result).to.deep.equal({
					pagination: params.pagination,
					users: [user]
				});
			});
		});
	});
});
