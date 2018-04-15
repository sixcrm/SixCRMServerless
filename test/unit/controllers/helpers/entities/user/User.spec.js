const mockery = require('mockery');
let chai = require('chai');
const expect = chai.expect;
const MockEntities = global.SixCRM.routes.include('test','mock-entities.js');
const objectutilities = global.SixCRM.routes.include('lib', 'object-utilities.js');

describe('controllers/helpers/entities/user/User.js', () => {

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

		mockery.registerMock(global.SixCRM.routes.path('controllers', 'providers/sns-provider.js'), class {
			publish() {
				return Promise.resolve({});
			}
			getRegion() {
				return 'localhost';
			}
		});
	});

	afterEach(() => {
		mockery.resetCache();
		mockery.deregisterAll();
	});

	describe('appendAlias', () => {

		it('returns user itself when user alias exists', () => {

			let user = MockEntities.getValidUser();

			const UserHelperController = global.SixCRM.routes.include('helpers', 'entities/user/User.js');
			const userHelperController = new UserHelperController();

			expect(userHelperController.appendAlias(user)).to.deep.equal(user);

		});

		it('successfully appends alias', () => {

			let user = MockEntities.getValidUser();

			delete user.alias;
			user.id = 'first.last@example.com'; //any email type id

			mockery.registerMock(global.SixCRM.routes.path('lib', 'random.js'), {
				createRandomString: () => {
					return 'a_random_string';
				}
			});

			const UserHelperController = global.SixCRM.routes.include('helpers', 'entities/user/User.js');
			const userHelperController = new UserHelperController();

			let result = userHelperController.appendAlias(user);

			expect(result.alias).to.equal('628243ee9c74e8b56e9026e3c26a7f53e5283037');
		});

	});

	describe('getFullName', () => {

		it('successfully builds the user fullname', () => {

			let user = MockEntities.getValidUser();

			const UserHelperController = global.SixCRM.routes.include('helpers', 'entities/user/User.js');
			const userHelperController = new UserHelperController();

			let result = userHelperController.getFullName(user);

			expect(result).to.equal(user.first_name+' '+user.last_name);

		});

		it('returns null when user doesn\'t have name fields', () => {

			let user = MockEntities.getValidUser();
			delete user.first_name;
			delete user.last_name;
			const UserHelperController = global.SixCRM.routes.include('helpers', 'entities/user/User.js');
			const userHelperController = new UserHelperController();

			let result = userHelperController.getFullName(user);

			expect(result).to.equal(null);

		});

		it('returns name portion when user doesn\'t have all name fields (missing first)', () => {

			let user = MockEntities.getValidUser();
			delete user.first_name;

			const UserHelperController = global.SixCRM.routes.include('helpers', 'entities/user/User.js');
			const userHelperController = new UserHelperController();

			let result = userHelperController.getFullName(user);

			expect(result).to.equal(user.last_name);
		});

		it('returns name portion when user doesn\'t have all name fields (missing last)', () => {

			let user = MockEntities.getValidUser();
			delete user.last_name;

			const UserHelperController = global.SixCRM.routes.include('helpers', 'entities/user/User.js');
			const userHelperController = new UserHelperController();

			let result = userHelperController.getFullName(user);

			expect(result).to.equal(user.first_name);

		});

	});

	describe('getAddress', () => {

		it('returns the address, when available (Note:  users don\'t have addresses?)', () => {

			let user = MockEntities.getValidUser();
			user.address  = {
				line1: '123 Main St.',
				line2: 'Apartment 1',
				city: 'Munich',
				state: 'IL',
				country: 'US',
				zip: '97213'
			};

			const UserHelperController = global.SixCRM.routes.include('helpers', 'entities/user/User.js');
			const userHelperController = new UserHelperController();

			let result = userHelperController.getAddress(user);

			expect(result).to.deep.equal(user.address);

		});

		it('returns null when the address is not available', () => {

			let user = MockEntities.getValidUser();
			delete user.address;

			const UserHelperController = global.SixCRM.routes.include('helpers', 'entities/user/User.js');
			const userHelperController = new UserHelperController();

			let result = userHelperController.getAddress(user);

			expect(result).to.equal(null);

		});

	});

	describe('getPrototypeUser', () => {

		it('returns a prototype user', () => {

			let email = MockEntities.getValidUser().id;

			const UserHelperController = global.SixCRM.routes.include('helpers', 'entities/user/User.js');
			const userHelperController = new UserHelperController();

			let result  = userHelperController.getPrototypeUser(email);

			expect(result).to.have.property('id');
			expect(result.id).to.equal(email);
			expect(result).to.have.property('active');
			expect(result.active).to.equal(false);
			expect(result).to.have.property('first_name');
			expect(result).to.have.property('last_name');
			expect(result.first_name).to.equal(email);
			expect(result.last_name).to.equal(email);

		});

	});

	describe('createProfile', () => {

		it('throws an error when the email argument is not a valid email', () => {

			const UserHelperController = global.SixCRM.routes.include('helpers', 'entities/user/User.js');
			const userHelperController = new UserHelperController();

			let email = 'some bad email';

			return userHelperController.createProfile(email).catch(error => {
				expect(error.message).to.equal('[500] Email is not a email: "'+email+'".')
			});

		});

		it('throws an error when the email is already associated with a user account', () => {

			let email = 'testemail@test.com';

			mockery.registerMock(global.SixCRM.routes.path('entities', 'User.js'), class {
				constructor(){}
				exists({entity}){
					expect(entity).to.have.property('id');
					expect(entity.id).to.equal(email);
					return Promise.resolve(true);
				}
				disableACLs(){}
			})

			const UserHelperController = global.SixCRM.routes.include('helpers', 'entities/user/User.js');
			const userHelperController = new UserHelperController();

			return userHelperController.createProfile(email).catch(error => {
				expect(error.message).to.equal('[400] A user account associated with the email "'+email+'" already exists.');
			});

		});

		it('succeeds', () => {

			let account = MockEntities.getValidAccount();
			let user = MockEntities.getValidUser();
			let role = MockEntities.getValidRole();
			let user_setting = MockEntities.getValidUserSetting(user.id);
			let user_acl = MockEntities.getValidUserACL();
			user_acl.user = user.id;
			user_acl.role = role.id;
			user_acl.account = account.id;

			mockery.registerMock(global.SixCRM.routes.path('entities', 'Account.js'), class {
				constructor(){}
				create(){
					return Promise.resolve(account);
				}
			});

			mockery.registerMock(global.SixCRM.routes.path('entities', 'Role.js'), class {
				constructor(){}
				get(){
					return Promise.resolve(role);
				}
			});

			mockery.registerMock(global.SixCRM.routes.path('entities', 'UserSetting.js'), class {
				constructor(){}
				create(){
					return Promise.resolve(user_setting);
				}
			});

			mockery.registerMock(global.SixCRM.routes.path('entities', 'User.js'), class {
				constructor(){}
				exists(){
					return Promise.resolve(false);
				}
				create(){
					return Promise.resolve(user);
				}
				disableACLs(){}
			});

			mockery.registerMock(global.SixCRM.routes.path('entities', 'UserACL.js'), class {
				constructor(){}
				create(){
					return Promise.resolve(user_acl);
				}
				enableACLs(){
					return true;
				}
			});

			const UserHelperController = global.SixCRM.routes.include('helpers', 'entities/user/User.js');
			const userHelperController = new UserHelperController();

			return userHelperController.createProfile(user.id).then(user => {
				expect(user).to.have.property('id');
				expect(user).to.have.property('acl');
			});

		});

	});

	describe('buildCreateProfilePrototypes', () => {

		it('successfully creates prototypes', () => {

			let email = 'testemail@test.com';

			const UserHelperController = global.SixCRM.routes.include('helpers', 'entities/user/User.js');
			const userHelperController = new UserHelperController();

			let prototypes = userHelperController.buildCreateProfilePrototypes(email);
			expect(prototypes).to.have.property('prototype_user');
			expect(prototypes).to.have.property('prototype_account');
			expect(prototypes).to.have.property('prototype_user_setting');
			objectutilities.map(prototypes, (key) => {
				expect(typeof prototypes[key]).to.equal('object');
			});

		});

	});

	describe('saveCreateProfilePrototypes', () => {

		it('successfully saves prototypes', () => {

			let account = MockEntities.getValidAccount();
			let user = MockEntities.getValidUser();
			let role = MockEntities.getValidRole();
			let user_setting = MockEntities.getValidUserSetting(user.id);

			mockery.registerMock(global.SixCRM.routes.path('entities', 'Account.js'), class {
				constructor(){}
				create(){
					return Promise.resolve(account);
				}
			});

			mockery.registerMock(global.SixCRM.routes.path('entities', 'User.js'), class {
				constructor(){}
				create(){
					return Promise.resolve(user);
				}
			});

			mockery.registerMock(global.SixCRM.routes.path('entities', 'Role.js'), class {
				constructor(){}
				get(){
					return Promise.resolve(role);
				}
			});

			mockery.registerMock(global.SixCRM.routes.path('entities', 'UserSetting.js'), class {
				constructor(){}
				create(){
					return Promise.resolve(user_setting);
				}
			});

			const UserHelperController = global.SixCRM.routes.include('helpers', 'entities/user/User.js');
			const userHelperController = new UserHelperController();

			let prototypes = userHelperController.buildCreateProfilePrototypes(user.email);

			return userHelperController.saveCreateProfilePrototypes(prototypes).then(entities => {

				expect(entities).to.have.property('user');
				expect(entities).to.have.property('account');
				expect(entities).to.have.property('role');
				expect(entities).to.have.property('user_setting');
				expect(entities.user.id).to.equal(user.id);
				expect(entities.account).to.have.property('id');
				expect(entities.role).to.have.property('id');
				expect(entities.user_setting.id).to.equal(user.id);

			});

		});

	});

	describe('introspection', () => {

		let global_user;

		before(() => {
			global_user = global.user;
		});

		afterEach(() => {
			global.user = global_user;
		});

		it('returns a user model for a email argument', () => {

			const user = MockEntities.getValidUser();
			user.acl = [MockEntities.getValidUserACL(),MockEntities.getValidUserACL()];
			user.acl[0].role = MockEntities.getValidRole();
			user.acl[1].role = MockEntities.getValidRole();
			user.acl[0].role.name = 'Owner';

			const usersetting = MockEntities.getValidUserSetting();
			usersetting.id = user.id;

			const expected_result = objectutilities.clone(user);
			expected_result.usersetting = usersetting;
			expected_result.termsandconditions_outdated = true;
			expected_result.acl[0].termsandconditions_outdated = true;

			mockery.registerMock(global.SixCRM.routes.path('entities', 'UserSetting.js'), class {
				constructor(){}
				get(){
					return Promise.resolve(usersetting);
				}
				disableACLs(){}
				enableACLs(){}
			});

			const UserHelperController = global.SixCRM.routes.include('helpers', 'entities/user/User.js');
			const userHelperController = new UserHelperController();

			userHelperController.createProfile = () => {
				return Promise.resolve(user);
			}

			return userHelperController.introspection(user.id).then(result => {
				expect(result).to.deep.equal(expected_result);
				expect(global.user).to.deep.equal(expected_result);
			});

		});

		it('returns a user model for a user argument', () => {

			const user = MockEntities.getValidUser();
			user.acl = [MockEntities.getValidUserACL(),MockEntities.getValidUserACL()];
			user.acl[0].role = MockEntities.getValidRole();
			user.acl[1].role = MockEntities.getValidRole();
			user.acl[0].role.name = 'Owner';

			const usersetting = MockEntities.getValidUserSetting();
			usersetting.id = user.id;

			const expected_result = objectutilities.clone(user);
			expected_result.usersetting = usersetting;
			expected_result.termsandconditions_outdated = true;
			expected_result.acl[0].termsandconditions_outdated = true;

			mockery.registerMock(global.SixCRM.routes.path('entities', 'UserSetting.js'), class {
				constructor(){}
				get(){
					return Promise.resolve(usersetting);
				}
				disableACLs(){}
				enableACLs(){}
			});

			const UserHelperController = global.SixCRM.routes.include('helpers', 'entities/user/User.js');
			const userHelperController = new UserHelperController();

			userHelperController.createProfile = () => {
				return Promise.resolve(user);
			}

			return userHelperController.introspection(user.id).then(result => {
				expect(result).to.deep.equal(expected_result);
				expect(global.user).to.deep.equal(expected_result);
			});

		});

	});

	describe('getMostRecentTermsAndConditionsDocuments', () => {

		it('gets recent T&C documents for Owner and User', () => {

			const UserHelperController = global.SixCRM.routes.include('helpers', 'entities/user/User.js');
			const userHelperController = new UserHelperController();

			return userHelperController.getMostRecentTermsAndConditionsDocuments().then(result => {
				expect(result).to.have.property('owner_tncs');
				expect(result).to.have.property('user_tncs');
			});

		});

	});

	describe('applyUserSettings', () => {
		it('sets the user settings to the user', () => {

			const user = MockEntities.getValidUser();
			const usersetting = MockEntities.getValidUserSetting();

			let expected_result = objectutilities.clone(user);
			expected_result.usersetting = usersetting;

			mockery.registerMock(global.SixCRM.routes.path('entities', 'UserSetting.js'), class {
				constructor(){}
				get(){
					return Promise.resolve(usersetting);
				}
				disableACLs(){}
				enableACLs(){}
			});

			const UserHelperController = global.SixCRM.routes.include('helpers', 'entities/user/User.js');
			const userHelperController = new UserHelperController();

			return userHelperController.applyUserSettings(user).then(result => {
				expect(result).to.deep.equal(expected_result);
			});

		});
	});

	describe('setGlobalUser', () => {

		let global_user;

		before(() => {
			global_user = global.user;
		});

		after(() => {
			global.user = global_user;
		});

		it('successfully sets the global user', () => {

			const user = MockEntities.getValidUser();

			const UserHelperController = global.SixCRM.routes.include('helpers', 'entities/user/User.js');
			const userHelperController = new UserHelperController();

			userHelperController.setGlobalUser(user);

			expect(global.user).to.deep.equal(user);

		});

	});

	describe('rectifyUserTermsAndConditions', () => {

		it('updates the user', () => {

			let user = MockEntities.getValidUser();
			let expected_user = objectutilities.clone(user);
			expected_user.termsandconditions_outdated = true;
			expected_user.acl = [];

			const UserHelperController = global.SixCRM.routes.include('helpers', 'entities/user/User.js');
			const userHelperController = new UserHelperController();

			return userHelperController.rectifyUserTermsAndConditions(user).then(result => {
				expect(result).to.deep.equal(expected_user);
			})

		});

		it('updates the user acls', () => {

			let user = MockEntities.getValidUser();
			let acl = MockEntities.getValidUserACL();
			let role = MockEntities.getValidRole();
			role.name = 'Owner';
			acl.role = role;
			user.acl = [acl];

			let other_acl = MockEntities.getValidUserACL();
			let other_role = MockEntities.getValidRole();
			other_acl.role = other_role;

			user.acl.push(other_acl);

			let expected_user = objectutilities.clone(user);
			expected_user.termsandconditions_outdated = true;
			expected_user.acl = [objectutilities.clone(acl), other_acl];
			expected_user.acl[0].termsandconditions_outdated = true;

			const UserHelperController = global.SixCRM.routes.include('helpers', 'entities/user/User.js');
			const userHelperController = new UserHelperController();

			return userHelperController.rectifyUserTermsAndConditions(user).then(result => {
				expect(result).to.deep.equal(expected_user);
			});

		});

	});

	describe('setIntrospectionUser',  () => {

		let global_user;

		before(() => {
			global_user = global.user;
		});

		afterEach(() => {
			global.user = global_user;
		});

		it('returns the user when a user is provided', () => {

			const user = MockEntities.getValidUser();

			const UserHelperController = global.SixCRM.routes.include('helpers', 'entities/user/User.js');
			const userHelperController = new UserHelperController();

			return userHelperController.setIntrospectionUser(user).then(result => {
				expect(result).to.deep.equal(user);
			});

		});

		it('returns the user when a email is provided', () => {

			const user = MockEntities.getValidUser();

			const UserHelperController = global.SixCRM.routes.include('helpers', 'entities/user/User.js');
			const userHelperController = new UserHelperController();

			userHelperController.createProfile = () => {
				return Promise.resolve(user);
			}

			return userHelperController.setIntrospectionUser(user.id).then(result => {
				expect(result).to.deep.equal(user);
			});

		});

		it('returns a error when no user is provided and fatal is true', () => {

			const UserHelperController = global.SixCRM.routes.include('helpers', 'entities/user/User.js');
			const userHelperController = new UserHelperController();

			try{
				userHelperController.setIntrospectionUser(null, true);
			}catch(error){
				expect(error.message).to.equal('[400] Introspection method requires a user argument in fatal mode.');
			}

		});

		it('returns a user from global (user is object)', () => {

			const user = MockEntities.getValidUser();
			global.user = user;

			const UserHelperController = global.SixCRM.routes.include('helpers', 'entities/user/User.js');
			const userHelperController = new UserHelperController();

			return userHelperController.setIntrospectionUser(null).then(result => {
				expect(result).to.deep.equal(user);
			});

		});

		it('returns a user from global (user is email)', () => {

			const user = MockEntities.getValidUser();
			global.user = user.id;

			const UserHelperController = global.SixCRM.routes.include('helpers', 'entities/user/User.js');
			const userHelperController = new UserHelperController();

			userHelperController.createProfile = () => {
				return Promise.resolve(user);
			}

			return userHelperController.setIntrospectionUser(null).then(result => {
				expect(result).to.deep.equal(user);
			});

		});

		it('returns error when neither user or global is set', () => {

			delete global.user;

			const UserHelperController = global.SixCRM.routes.include('helpers', 'entities/user/User.js');
			const userHelperController = new UserHelperController();

			try{
				userHelperController.setIntrospectionUser(null);
			}catch(error){
				expect(error.message).to.equal('[400] Introspection method requires a global user or a user argument.');
			}

		});

	});

});
