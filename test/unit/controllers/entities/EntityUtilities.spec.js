

const mockery = require('mockery');
let chai = require('chai');
let expect = chai.expect;

const MockEntities = global.SixCRM.routes.include('test', 'mock-entities.js');

function getValidNotificationSettings(){
	return MockEntities.getValidNotificationSettings();
}

describe('controllers/EntityUtilities.js', () => {

	before(() => {
		mockery.enable({
			useCleanCache: true,
			warnOnReplace: false,
			warnOnUnregistered: false
		});
	});

	beforeEach(() => {
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

	describe('sanitization', () => {
		it('has a sanitize property', () => {
			const EUC = global.SixCRM.routes.include('controllers','entities/EntityUtilities.js');
			const entityUtilitiesController = new EUC();

			expect(entityUtilitiesController.sanitization).to.equal(true);
		});

		it('can be changed with the sanitize() method', () => {
			const EUC = global.SixCRM.routes.include('controllers','entities/EntityUtilities.js');
			const entityUtilitiesController = new EUC();

			entityUtilitiesController.sanitize(false);
			expect(entityUtilitiesController.sanitization).to.equal(false);
		});

		it('returns this so it can be set in a chain', () => {
			const EUC = global.SixCRM.routes.include('controllers','entities/EntityUtilities.js');
			const entityUtilitiesController = new EUC();

			expect(entityUtilitiesController.sanitize(false)).to.equal(entityUtilitiesController);
		});
	});

	describe('catchPermissions', () => {

		it('returns true for valid permissions for specified action', () => {

			const EUC = global.SixCRM.routes.include('controllers','entities/EntityUtilities.js');
			let entityUtilitiesController = new EUC();

			expect(entityUtilitiesController.catchPermissions(true, 'create')).to.be.true;
		});

		it('returns true when for default action', () => {

			const EUC = global.SixCRM.routes.include('controllers','entities/EntityUtilities.js');
			let entityUtilitiesController = new EUC();

			expect(entityUtilitiesController.catchPermissions(true)).to.be.true;
		});

		it('throws error for false', () => {

			const EUC = global.SixCRM.routes.include('controllers','entities/EntityUtilities.js');
			let entityUtilitiesController = new EUC();

			try {
				entityUtilitiesController.catchPermissions(false)
			}catch (error) {
				expect(error.message).to.equal('[403] Invalid Permissions: user does not have sufficient permission to perform this action.');
			}
		});

		it('throws error when user does not have permission for specified action', () => {

			const EUC = global.SixCRM.routes.include('controllers','entities/EntityUtilities.js');
			let entityUtilitiesController = new EUC();

			try {
				entityUtilitiesController.catchPermissions(false, 'update')
			}catch (error) {
				expect(error.message).to.equal('[403] Invalid Permissions: user does not have sufficient permission to perform this action.');
			}
		});
	});

	describe('handleErrors', () => {

		it('throws forbidden error when error code is 403', () => {

			let fail = {
				code: '403',
				message: 'Forbidden error message.' //Sample error message
			};

			const EUC = global.SixCRM.routes.include('controllers','entities/EntityUtilities.js');
			let entityUtilitiesController = new EUC();

			try {
				entityUtilitiesController.handleErrors(fail, true)
			}catch (error) {
				expect(error.message).to.equal(fail.message);
			}
		});

		it('returns null if error is not fatal', () => {

			let fail = {
				code: '403',
				message: 'Forbidden error message.' //Sample error message
			};

			const EUC = global.SixCRM.routes.include('controllers','entities/EntityUtilities.js');
			let entityUtilitiesController = new EUC();

			expect(entityUtilitiesController.handleErrors(fail, false)).to.equal(null);
		});

		it('throws specified error', () => {

			let fail = {
				code: '404',
				message: 'Not found error message.' //Sample error message
			};

			const EUC = global.SixCRM.routes.include('controllers','entities/EntityUtilities.js');
			let entityUtilitiesController = new EUC();

			try {
				entityUtilitiesController.handleErrors(fail, true)
			}catch (error) {
				expect(error.message).to.equal(fail.message);
			}
		});

		it('throws server error when error code is not defined and error is fatal', () => {

			let fail = 'Some server error message.'; //Sample error message

			const EUC = global.SixCRM.routes.include('controllers','entities/EntityUtilities.js');
			let entityUtilitiesController = new EUC();

			try {
				entityUtilitiesController.handleErrors(fail, true)
			}catch (error) {
				expect(error.message).to.equal('[500] Some server error message.');
			}
		});

		it('throws server error when error code is not defined', () => {

			let fail = 'Some server error message.'; //Sample error message

			const EUC = global.SixCRM.routes.include('controllers','entities/EntityUtilities.js');
			let entityUtilitiesController = new EUC();

			try {
				entityUtilitiesController.handleErrors(fail)
			}catch (error) {
				expect(error.message).to.equal('[500] Some server error message.');
			}
		});
	});

	describe('prune', () => {

		it('returns entity itself when entity is not an object', () => {

			let entity = 'sample non object entity';

			const EUC = global.SixCRM.routes.include('controllers','entities/EntityUtilities.js');
			let entityUtilitiesController = new EUC();

			expect(entityUtilitiesController.prune(entity)).to.equal(entity);
		});

		it('returns pruned entity when default primary key is set', () => {

			let entity = {
				any_value: {
					id: 'dummy id'
				}
			};

			const EUC = global.SixCRM.routes.include('controllers','entities/EntityUtilities.js');
			let entityUtilitiesController = new EUC();

			entityUtilitiesController.primary_key = 'id'; //set primary key

			expect(entityUtilitiesController.prune(entity)).to.deep.equal({ any_value: 'dummy id' });
		});

		it('returns pruned entity when primary key is specified', () => {

			let entity = {
				any_value: {
					a_primary_key: 'dummy id'
				}
			};

			const EUC = global.SixCRM.routes.include('controllers','entities/EntityUtilities.js');
			let entityUtilitiesController = new EUC();

			expect(entityUtilitiesController.prune(entity, 'a_primary_key')).to.deep.equal({ any_value: 'dummy id' });
		});

		it('returns entity when specified primary key is not present in an entity', () => {

			let entity = {
				any_value: {
					another_primary_key: 'dummy id'
				}
			};

			const EUC = global.SixCRM.routes.include('controllers','entities/EntityUtilities.js');
			let entityUtilitiesController = new EUC();

			expect(entityUtilitiesController.prune(entity, 'a_primary_key')).to.deep.equal(entity);
		});
	});

	describe('validate', () => {

		it('returns true when model is valid', () => {

			const EUC = global.SixCRM.routes.include('controllers','entities/EntityUtilities.js');
			let entityUtilitiesController = new EUC();

			entityUtilitiesController.descriptive_name = 'notificationsetting';

			return entityUtilitiesController.validate(getValidNotificationSettings()).then((result) => {
				expect(result).to.be.true;
			});
		});

		it('returns true when model and path to model are valid', () => {

			let path_to_model = '../../../model/entities/notificationsetting.json'; //valid path

			const EUC = global.SixCRM.routes.include('controllers','entities/EntityUtilities.js');
			let entityUtilitiesController = new EUC();

			entityUtilitiesController.descriptive_name = 'notificationsetting';

			return entityUtilitiesController.validate(getValidNotificationSettings(), path_to_model).then((result) => {
				expect(result).to.be.true;
			});
		});

		it('throws error when path to model is invalid', () => {

			let path_to_model = './nonexisting/path/to/model/any.json'; //invalid path

			const EUC = global.SixCRM.routes.include('controllers','entities/EntityUtilities.js');
			let entityUtilitiesController = new EUC();

			entityUtilitiesController.descriptive_name = 'notificationsetting';

			try {
				entityUtilitiesController.validate(getValidNotificationSettings(), path_to_model)
			}catch(error) {
				expect(error.message).to.equal('Cannot find module \'' + path_to_model + '\'');
			}
		});
	});

	describe('getUUID', () => {

		it('returns valid UUID version 4', () => {

			const EUC = global.SixCRM.routes.include('controllers','entities/EntityUtilities.js');
			let entityUtilitiesController = new EUC();

			let result = entityUtilitiesController.getUUID();

			expect(result).to.be.defined;
			expect(result).to.be.a('string');
			expect(result.length).to.equal(36);
		});
	});

	describe('isUUID', () => {

		it('returns true if it is a valid UUID', () => {

			const EUC = global.SixCRM.routes.include('controllers','entities/EntityUtilities.js');
			let entityUtilitiesController = new EUC();

			expect(entityUtilitiesController.isUUID('7721e753-eda4-489c-b501-24b3d7ef8c6e', 4)).to.be.true;
		});

		it('returns false if it is not a valid UUID', () => {

			const EUC = global.SixCRM.routes.include('controllers','entities/EntityUtilities.js');
			let entityUtilitiesController = new EUC();

			let invalid_uuids = ['not-valid-uuid', '', '123456456789', null, 123, -456, 123.456789, {}, [], () => {}];

			invalid_uuids.forEach(invalid_uuid => {
				expect(entityUtilitiesController.isUUID(invalid_uuid)).to.be.false;
			});
		});
	});

	describe('isEmail', () => {

		it('returns true if it is a valid email', () => {

			const EUC = global.SixCRM.routes.include('controllers','entities/EntityUtilities.js');
			let entityUtilitiesController = new EUC();

			expect(entityUtilitiesController.isEmail('testemail@example.com')).to.be.true;
		});

		it('returns false if it is not a valid email', () => {

			const EUC = global.SixCRM.routes.include('controllers','entities/EntityUtilities.js');
			let entityUtilitiesController = new EUC();

			let invalid_emails = ['not-valid-email', 'test.com', 'example@', 'example@test', '', '123456456789', null, 123, -456, 123.456789, {}, [], () => {}];

			invalid_emails.forEach(invalid_uuid => {
				expect(entityUtilitiesController.isEmail(invalid_uuid)).to.be.false;
			});
		});
	});

	describe('acquireGlobalUser', () => {

		let user_copy;

		beforeEach(() => {
			user_copy = global.user;
		});

		afterEach(() => {
			global.user = user_copy;
		});

		it('returns null when global.user is not set', () => {

			const EUC = global.SixCRM.routes.include('controllers','entities/EntityUtilities.js');
			let entityUtilitiesController = new EUC();

			delete global.user;

			expect(entityUtilitiesController.acquireGlobalUser()).to.equal(null);
		});

		it('returns global user when global.user is previously set', () => {

			const EUC = global.SixCRM.routes.include('controllers','entities/EntityUtilities.js');
			let entityUtilitiesController = new EUC();

			global.user = 'a_user';

			expect(entityUtilitiesController.acquireGlobalUser()).to.equal('a_user');
		});
	});

	describe('acquireGlobalAccount', () => {

		let account_copy;

		beforeEach(() => {
			account_copy = global.account;
		});

		afterEach(() => {
			global.account = account_copy;
		});

		it('returns null when global.account is not set', () => {

			const EUC = global.SixCRM.routes.include('controllers','entities/EntityUtilities.js');
			let entityUtilitiesController = new EUC();

			delete global.account;

			expect(entityUtilitiesController.acquireGlobalAccount()).to.equal(null);
		});

		it('returns global account when global.account is previously set', () => {

			const EUC = global.SixCRM.routes.include('controllers','entities/EntityUtilities.js');
			let entityUtilitiesController = new EUC();

			global.account = 'an_account';

			expect(entityUtilitiesController.acquireGlobalAccount()).to.equal('an_account');
		});
	});

	describe('setCreatedAt', () => {

		it('sets "created at" and "updated at" for specified entity', () => {

			let an_entity = {};

			const EUC = global.SixCRM.routes.include('controllers','entities/EntityUtilities.js');
			let entityUtilitiesController = new EUC();

			let result = entityUtilitiesController.setCreatedAt(an_entity);

			expect(result.created_at).to.be.defined;
			expect(result.updated_at).to.be.defined;
			expect(result.created_at).to.equal(result.updated_at);
		});

		it('sets "created at" to appointed time', () => {

			let an_entity = {};

			let created_at = '2017-12-13T11:34:01.103Z';

			const EUC = global.SixCRM.routes.include('controllers','entities/EntityUtilities.js');
			let entityUtilitiesController = new EUC();

			let result = entityUtilitiesController.setCreatedAt(an_entity, created_at);

			expect(result.created_at).to.be.defined;
			expect(result.updated_at).to.be.defined;
			expect(result.created_at).to.equal(result.updated_at);
			expect(result.created_at).to.equal(created_at);
		});
	});

	describe('setUpdatedAt', () => {

		it('sets "updated at" for specified entity if "updated at" does not previously exist', () => {

			let an_entity = {
				created_at: '2017-12-13T11:34:01.103Z'
			};

			const EUC = global.SixCRM.routes.include('controllers','entities/EntityUtilities.js');
			let entityUtilitiesController = new EUC();

			let result = entityUtilitiesController.setUpdatedAt(an_entity);

			expect(result.created_at).to.be.defined;
			expect(result.updated_at).to.be.defined;
			expect(result.created_at).to.equal(result.updated_at);
		});

		it('sets "updated at" for specified entity if "updated at" previously exists', () => {

			let an_entity = {
				created_at: '2017-12-13T11:34:01.103Z',
				updated_at: '2017-12-14T11:34:01.103Z'
			};

			const EUC = global.SixCRM.routes.include('controllers','entities/EntityUtilities.js');
			let entityUtilitiesController = new EUC();

			let result = entityUtilitiesController.setUpdatedAt(an_entity);

			expect(result.created_at).to.be.defined;
			expect(result.updated_at).to.be.defined;
			expect(result.created_at).not.to.equal(result.updated_at);
		});

		it('throws error when "created at" is not set', () => {

			let an_entity = {};

			const EUC = global.SixCRM.routes.include('controllers','entities/EntityUtilities.js');
			let entityUtilitiesController = new EUC();

			try {
				entityUtilitiesController.setUpdatedAt(an_entity);
			}catch (error) {
				expect(error.message).to.equal('[500] Entity lacks a "created_at" property');
			}
		});
	});

	describe('persistCreatedUpdated', () => {

		it('sets "created at" and "updated at" for specified entity', () => {

			let an_entity = {};

			let exists = {
				created_at: '2017-12-13T11:34:01.103Z',
				updated_at: '2017-12-14T11:34:01.103Z'
			};

			const EUC = global.SixCRM.routes.include('controllers','entities/EntityUtilities.js');
			let entityUtilitiesController = new EUC();

			let result = entityUtilitiesController.persistCreatedUpdated(an_entity, exists);

			expect(result.created_at).to.be.defined;
			expect(result.updated_at).to.be.defined;
			expect(result.created_at).to.equal(exists.created_at);
			expect(result.updated_at).to.equal(exists.updated_at);
		});

		it('throws error when "updated at" is not set', () => {

			let an_entity = {};

			let exists = {
				created_at: '2017-12-13T11:34:01.103Z'
			};

			const EUC = global.SixCRM.routes.include('controllers','entities/EntityUtilities.js');
			let entityUtilitiesController = new EUC();

			try{
				entityUtilitiesController.persistCreatedUpdated(an_entity, exists)
			}catch (error) {
				expect(error.message).to.equal('[500] Entity lacks "updated_at" property.')
			}
		});

		it('throws error when "created at" is not set', () => {

			let an_entity = {};

			let exists = {};

			const EUC = global.SixCRM.routes.include('controllers','entities/EntityUtilities.js');
			let entityUtilitiesController = new EUC();

			try{
				entityUtilitiesController.persistCreatedUpdated(an_entity, exists)
			}catch (error) {
				expect(error.message).to.equal('[500] Entity lacks "created_at" property.')
			}
		});
	});

	describe('marryQueryParameters', () => {

		it('returns first param extended with non-overlapping key/values from second param', () => {

			let any_param = {
				a: 'b',
				c: 'd'
			};

			let any_other_param = {
				c: 'g',
				e: 'f'
			};

			const EUC = global.SixCRM.routes.include('controllers','entities/EntityUtilities.js');
			let entityUtilitiesController = new EUC();

			expect(entityUtilitiesController.marryQueryParameters(any_param, any_other_param)).to.deep.equal({
				a: 'b',
				c: 'd',
				e: 'f'
			});
		});

		it('throws error when second argument is not an object', () => {

			let any_param = {
				a: 'b',
				c: 'd'
			};

			let any_other_param = 'not an object';

			const EUC = global.SixCRM.routes.include('controllers','entities/EntityUtilities.js');
			let entityUtilitiesController = new EUC();

			try {
				entityUtilitiesController.marryQueryParameters(any_param, any_other_param)
			} catch(error){
				expect(error.message).to.equal('[500] Thing is not an object.');
			}
		});

		it('returns second argument when first is undefined', () => {

			let any_param = {a: 'b'};

			const EUC = global.SixCRM.routes.include('controllers','entities/EntityUtilities.js');
			let entityUtilitiesController = new EUC();

			expect(entityUtilitiesController.marryQueryParameters(undefined, any_param)).to.deep.equal(any_param);
		});
	});

	describe('assureSingular', () => {

		it('throws error when argumentation is not an array', () => {

			const EUC = global.SixCRM.routes.include('controllers','entities/EntityUtilities.js');
			let entityUtilitiesController = new EUC();

			try{
				entityUtilitiesController.assureSingular()
			}catch(error){
				expect(error.message).to.equal('[500] ArrayUtilities.isArray thing argument is not an array.');
			}
		});

		it('throws error when array has more than one element', () => {

			const EUC = global.SixCRM.routes.include('controllers','entities/EntityUtilities.js');
			let entityUtilitiesController = new EUC();

			try{
				entityUtilitiesController.assureSingular(['any_elem', 'any_other_elem'])
			}catch(error){
				expect(error.message).to.equal('[500] Non-specific undefined entity results.');
			}
		});

		it('returns null when argumentation is null', () => {

			const EUC = global.SixCRM.routes.include('controllers','entities/EntityUtilities.js');
			let entityUtilitiesController = new EUC();

			expect(entityUtilitiesController.assureSingular(null)).to.equal(null);
		});

		it('returns null when array is empty', () => {

			const EUC = global.SixCRM.routes.include('controllers','entities/EntityUtilities.js');
			let entityUtilitiesController = new EUC();

			expect(entityUtilitiesController.assureSingular([])).to.equal(null);
		});

		it('returns single element from array when array only has one element', () => {

			const EUC = global.SixCRM.routes.include('controllers','entities/EntityUtilities.js');
			let entityUtilitiesController = new EUC();

			expect(entityUtilitiesController.assureSingular(['a_single_element'])).to.equal('a_single_element');
		});
	});

	describe('assignPrimaryKey', () => {

		it('sets primary key of entity', () => {

			let an_entity = {};

			const EUC = global.SixCRM.routes.include('controllers','entities/EntityUtilities.js');
			let entityUtilitiesController = new EUC();

			entityUtilitiesController.primary_key = 'id';

			let result = entityUtilitiesController.assignPrimaryKey(an_entity);

			expect(result.id).to.be.defined;
			expect(result.id).to.be.a('string');
			expect(result.id.length).to.equal(36);
		});

		it('returns unchanged entity when primary key is not an id', () => {

			let an_entity = {};

			const EUC = global.SixCRM.routes.include('controllers','entities/EntityUtilities.js');
			let entityUtilitiesController = new EUC();

			entityUtilitiesController.primary_key = 'any_primary_key'; //any primary key that is not an 'id'

			expect(entityUtilitiesController.assignPrimaryKey(an_entity)).to.equal(an_entity);
		});
	});

	describe('assignAccount', () => {

		let account_copy;

		beforeEach(() => {
			account_copy = global.account;
		});

		afterEach(() => {
			global.account = account_copy;
		});

		it('assigns an account to an entity', () => {

			let an_entity = {};

			const EUC = global.SixCRM.routes.include('controllers','entities/EntityUtilities.js');
			let entityUtilitiesController = new EUC();

			entityUtilitiesController.descriptive_name = 'any_entity';
			entityUtilitiesController.nonaccounts = ['any_other_entity'];

			global.account = 'an_account';

			expect(entityUtilitiesController.assignAccount(an_entity)).to.deep.equal({account: 'an_account'});
		});

		it('returns unchanged entity when it already exists in the non-account list', () => {

			let an_entity = {};

			const EUC = global.SixCRM.routes.include('controllers','entities/EntityUtilities.js');
			let entityUtilitiesController = new EUC();

			entityUtilitiesController.descriptive_name = 'any_entity';
			entityUtilitiesController.nonaccounts = ['any_entity', 'any_other_entity'];

			global.account = 'an_account';

			expect(entityUtilitiesController.assignAccount(an_entity)).to.deep.equal(an_entity);
		});

		it('returns unchanged entity when global account is not available', () => {

			let an_entity = {};

			const EUC = global.SixCRM.routes.include('controllers','entities/EntityUtilities.js');
			let entityUtilitiesController = new EUC();

			delete global.account;

			expect(entityUtilitiesController.assignAccount(an_entity)).to.deep.equal(an_entity);
		});

		it('returns unchanged entity when entity is already bound to an account', () => {

			let an_entity = {
				account: 'an_account'
			};

			const EUC = global.SixCRM.routes.include('controllers','entities/EntityUtilities.js');
			let entityUtilitiesController = new EUC();

			expect(entityUtilitiesController.assignAccount(an_entity)).to.deep.equal(an_entity);
		});
	});

	describe('appendLimit', () => {

		it('appends limit to query parameters', () => {

			const EUC = global.SixCRM.routes.include('controllers','entities/EntityUtilities.js');
			let entityUtilitiesController = new EUC();

			//any number between 1 and 100 for limit
			expect(entityUtilitiesController.appendLimit({query_parameters: {}, limit: 5}))
				.to.deep.equal({"limit": 5});
		});

		it('appends limit to query parameters when specified limit is a number-like string', () => {

			const EUC = global.SixCRM.routes.include('controllers','entities/EntityUtilities.js');
			let entityUtilitiesController = new EUC();

			//any number-like string between 1 and 100 for limit
			expect(entityUtilitiesController.appendLimit({query_parameters: {}, limit: '21'}))
				.to.deep.equal({"limit": 21});
		});

		it('appends default limit to query parameters', () => {

			const EUC = global.SixCRM.routes.include('controllers','entities/EntityUtilities.js');
			let entityUtilitiesController = new EUC();

			//limit is neither string nor number
			expect(entityUtilitiesController.appendLimit({query_parameters: {}, limit: {}}))
				.to.deep.equal({"limit": 100});
		});

		it('appends default limit to query parameters when limit is undefined', () => {

			const EUC = global.SixCRM.routes.include('controllers','entities/EntityUtilities.js');
			let entityUtilitiesController = new EUC();

			//limit is not defined
			expect(entityUtilitiesController.appendLimit({}))
				.to.deep.equal({"limit": 100});
		});

		it('throws error when limit is less than 1', () => {

			const EUC = global.SixCRM.routes.include('controllers','entities/EntityUtilities.js');
			let entityUtilitiesController = new EUC();

			//limit is less than 1
			try {
				entityUtilitiesController.appendLimit({query_parameters: {}, limit: -3})
			}catch(error) {
				expect(error.message).to.equal('[500] The graph API limit minimum is 1.');
			}
		});

		it('throws error when limit is bigger than 100', () => {

			const EUC = global.SixCRM.routes.include('controllers','entities/EntityUtilities.js');
			let entityUtilitiesController = new EUC();

			//limit is bigger than 100
			try {
				entityUtilitiesController.appendLimit({query_parameters: {}, limit: 110})
			}catch(error) {
				expect(error.message).to.equal('[500] The graph API record limit is 100.');
			}
		});
	});

	describe('assurePresence', () => {

		it('returns unchanged object when object contains specified field', () => {

			let a_thing = {a_field: 'any_field'};
			let a_default_value = {a_default_value: 'any_default_value'};

			const EUC = global.SixCRM.routes.include('controllers','entities/EntityUtilities.js');
			let entityUtilitiesController = new EUC();

			expect(entityUtilitiesController.assurePresence(a_thing, 'a_field', a_default_value))
				.to.deep.equal(a_thing);
		});

		it('returns object with appended specified default value', () => {

			let a_thing = {another_field: 'any_field'};
			let a_default_value = {a_default_value: 'any_default_value'};

			const EUC = global.SixCRM.routes.include('controllers','entities/EntityUtilities.js');
			let entityUtilitiesController = new EUC();

			expect(entityUtilitiesController.assurePresence(a_thing, 'a_field', a_default_value))
				.to.deep.equal({another_field: 'any_field', a_field: {a_default_value: 'any_default_value'}});
		});

		it('returns object with appended default value when default value is not specified', () => {

			let a_thing = {another_field: 'any_field'};

			const EUC = global.SixCRM.routes.include('controllers','entities/EntityUtilities.js');
			let entityUtilitiesController = new EUC();

			expect(entityUtilitiesController.assurePresence(a_thing, 'a_field'))
				.to.deep.equal({another_field: 'any_field', a_field: {}});
		});
	});

	describe('appendExpressionAttributeNames', () => {

		it('appends expression attribute names', () => {

			let query_parameters = {
				expression_attribute_names: {},
				some_other_value:'some_other_value'
			};
			let any_value = 'any_value';

			const EUC = global.SixCRM.routes.include('controllers','entities/EntityUtilities.js');
			let entityUtilitiesController = new EUC();

			expect(entityUtilitiesController.appendExpressionAttributeNames(query_parameters, 'a_key', any_value))
				.to.deep.equal({
					expression_attribute_names: {"a_key": "any_value"},
					some_other_value:'some_other_value'
				});
		});

		it('appends expression attribute names when query parameters are undefined', () => {

			let any_value = 'any_value';

			const EUC = global.SixCRM.routes.include('controllers','entities/EntityUtilities.js');
			let entityUtilitiesController = new EUC();

			expect(entityUtilitiesController.appendExpressionAttributeNames(undefined, 'a_key', any_value))
				.to.deep.equal({expression_attribute_names: {"a_key": "any_value"}});
		});
	});

	describe('appendKeyConditionExpression', () => {

		it('appends conjunction and key condition expression', () => {

			let query_parameters = {
				key_condition_expression: 'any_value',
				some_other_value:'some_other_value'
			};

			const EUC = global.SixCRM.routes.include('controllers','entities/EntityUtilities.js');
			let entityUtilitiesController = new EUC();

			expect(entityUtilitiesController.appendKeyConditionExpression(query_parameters, 'a_condition_expression', 'a_conjunction'))
				.to.deep.equal({
					"key_condition_expression": "any_value a_conjunction a_condition_expression",
					"some_other_value": "some_other_value"
				});
		});

		it('assures condition expression and appends it to query parameters', () => {

			let query_parameters = {
				some_other_value:'some_other_value'
			};

			const EUC = global.SixCRM.routes.include('controllers','entities/EntityUtilities.js');
			let entityUtilitiesController = new EUC();

			expect(entityUtilitiesController.appendKeyConditionExpression(query_parameters, 'a_condition_expression'))
				.to.deep.equal({
					"key_condition_expression": "a_condition_expression",
					"some_other_value": "some_other_value"
				});
		});

		it('appends default conjunction and key condition expression', () => {

			let query_parameters = {
				key_condition_expression: 'any_value',
				some_other_value:'some_other_value'
			};

			const EUC = global.SixCRM.routes.include('controllers','entities/EntityUtilities.js');
			let entityUtilitiesController = new EUC();

			expect(entityUtilitiesController.appendKeyConditionExpression(query_parameters, 'a_condition_expression'))
				.to.deep.equal({
					"key_condition_expression": "any_value AND a_condition_expression",
					"some_other_value": "some_other_value"
				});
		});
	});

	describe('appendExpressionAttributeValues', () => {

		it('appends expression attribute values', () => {

			let query_parameters = {
				expression_attribute_values: {},
				some_other_value:'some_other_value'
			};

			const EUC = global.SixCRM.routes.include('controllers','entities/EntityUtilities.js');
			let entityUtilitiesController = new EUC();

			expect(entityUtilitiesController.appendExpressionAttributeValues(query_parameters, 'a_key', 'a_value'))
				.to.deep.equal({
					"expression_attribute_values": {"a_key": "a_value"},
					"some_other_value": "some_other_value"
				});
		});

		it('assures and appends expression attribute values', () => {

			const EUC = global.SixCRM.routes.include('controllers','entities/EntityUtilities.js');
			let entityUtilitiesController = new EUC();

			expect(entityUtilitiesController.appendExpressionAttributeValues(undefined, 'a_key', 'a_value'))
				.to.deep.equal({expression_attribute_values: {"a_key": "a_value"}});
		});
	});

	describe('appendFilterExpression', () => {

		it('appends filter expression', () => {

			let query_parameters = {
				filter_expression: 'any value',
				some_other_value:'some_other_value'
			};

			const EUC = global.SixCRM.routes.include('controllers','entities/EntityUtilities.js');
			let entityUtilitiesController = new EUC();

			expect(entityUtilitiesController.appendFilterExpression(query_parameters, 'a_filter_expression'))
				.to.deep.equal({
					"filter_expression": "any value AND a_filter_expression",
					"some_other_value": "some_other_value"
				});
		});

		it('assures and appends filter expression', () => {

			let query_parameters = {
				some_other_value:'some_other_value'
			};

			const EUC = global.SixCRM.routes.include('controllers','entities/EntityUtilities.js');
			let entityUtilitiesController = new EUC();

			expect(entityUtilitiesController.appendFilterExpression(query_parameters, 'a_filter_expression'))
				.to.deep.equal({
					"filter_expression": "a_filter_expression",
					"some_other_value": "some_other_value"
				});
		});

		it('appends new filter expression value when previous value is null', () => {

			let query_parameters = {
				filter_expression: null,
				some_other_value:'some_other_value'
			};

			const EUC = global.SixCRM.routes.include('controllers','entities/EntityUtilities.js');
			let entityUtilitiesController = new EUC();

			expect(entityUtilitiesController.appendFilterExpression(query_parameters, 'a_filter_expression'))
				.to.deep.equal({
					"filter_expression": "a_filter_expression",
					"some_other_value": "some_other_value"
				});
		});

		it('appends new filter expression when previous value is an empty string', () => {

			let query_parameters = {
				filter_expression: '',
				some_other_value:'some_other_value'
			};

			const EUC = global.SixCRM.routes.include('controllers','entities/EntityUtilities.js');
			let entityUtilitiesController = new EUC();

			expect(entityUtilitiesController.appendFilterExpression(query_parameters, 'a_filter_expression'))
				.to.deep.equal({
					"filter_expression": "a_filter_expression",
					"some_other_value": "some_other_value"
				});
		});

		it('throws error when filter expression from query parameters is not a string', () => {

			let query_parameters = {
				filter_expression: 123, //non string value
				some_other_value:'some_other_value'
			};

			const EUC = global.SixCRM.routes.include('controllers','entities/EntityUtilities.js');
			let entityUtilitiesController = new EUC();

			try {
				entityUtilitiesController.appendFilterExpression(query_parameters, 'a_filter_expression')
			}catch(error) {
				expect(error.message).to.equal('[400] Unrecognized query parameter filter expression type.');
			}
		});
	});

	describe('getItems', () => {

		it('retrieves items from appointed data', () => {

			let data = {Items: ['a', 'b']};

			const EUC = global.SixCRM.routes.include('controllers','entities/EntityUtilities.js');
			let entityUtilitiesController = new EUC();

			expect(entityUtilitiesController.getItems(data)).to.deep.equal(data.Items);
		});

		it('returns null when items are not an array', () => {
			const EUC = global.SixCRM.routes.include('controllers','entities/EntityUtilities.js');
			let entityUtilitiesController = new EUC();

			//items are not an array
			expect(entityUtilitiesController.getItems({Items: ''})).to.equal(null);
		});
	});

	describe('getID', () => {

		it('returns unchanged string', () => {

			const EUC = global.SixCRM.routes.include('controllers','entities/EntityUtilities.js');
			let entityUtilitiesController = new EUC();

			expect(entityUtilitiesController.getID('any_string')).to.equal('any_string');
		});

		it('returns value from primary key if such exists in specified object', () => {

			const EUC = global.SixCRM.routes.include('controllers','entities/EntityUtilities.js');
			let entityUtilitiesController = new EUC();

			entityUtilitiesController.primary_key = 'id';

			expect(entityUtilitiesController.getID({id: 'an_id'})).to.equal('an_id');
		});

		it('throws error when primary key does not exist in specified object', () => {

			const EUC = global.SixCRM.routes.include('controllers','entities/EntityUtilities.js');
			let entityUtilitiesController = new EUC();

			entityUtilitiesController.primary_key = 'id';

			try {
				entityUtilitiesController.getID({any_primary_key: 'an_id'})
			}catch (error){
				expect(error.message).to.equal('[400] Could not determine identifier for undefined for ID [object Object].');
			}
		});

		it('throws error when argumentation is not an expected value', () => {

			const EUC = global.SixCRM.routes.include('controllers','entities/EntityUtilities.js');
			let entityUtilitiesController = new EUC();

			try {
				entityUtilitiesController.getID()
			}catch (error){
				expect(error.message).to.equal('[400] Could not determine identifier for undefined for ID undefined.');
			}
		});

		it('returns null when argumentation is null', () => {

			const EUC = global.SixCRM.routes.include('controllers','entities/EntityUtilities.js');
			let entityUtilitiesController = new EUC();

			entityUtilitiesController.primary_key = 'id';

			expect(entityUtilitiesController.getID(null)).to.equal(null);
		});
	});

	describe('getDescriptiveName', () => {

		it('returns descriptive name if it is set', () => {

			const EUC = global.SixCRM.routes.include('controllers','entities/EntityUtilities.js');
			let entityUtilitiesController = new EUC();

			entityUtilitiesController.descriptive_name = 'a_descriptive_name';

			expect(entityUtilitiesController.getDescriptiveName()).to.equal('a_descriptive_name');
		});

		it('returns null if descriptive name is not set', () => {

			const EUC = global.SixCRM.routes.include('controllers','entities/EntityUtilities.js');
			let entityUtilitiesController = new EUC();

			delete entityUtilitiesController.descriptive_name;

			expect(entityUtilitiesController.getDescriptiveName()).to.equal(null);
		});
	});

	describe('translateControllerNameToFilename', () => {

		it('translates controller name to filename', () => {

			const EUC = global.SixCRM.routes.include('controllers','entities/EntityUtilities.js');
			let entityUtilitiesController = new EUC();

			expect(entityUtilitiesController.translateControllerNameToFilename('aNameOfController')).to.equal('ANameOf.js');
		});
	});

	describe('createEndOfPaginationResponse', () => {

		it('creates end of pagination response', () => {
			let any_items = ['a', 'b'];

			const EUC = global.SixCRM.routes.include('controllers','entities/EntityUtilities.js');
			let entityUtilitiesController = new EUC();

			return entityUtilitiesController.createEndOfPaginationResponse('entities', any_items).then((result) => {
				expect(result).to.deep.equal({
					entities: any_items,
					pagination: {
						count: 2,
						end_cursor: '',
						has_next_page: false
					}
				});
			});
		});
	});

	describe('transformListArray', () => {

		it('transforms list array', () => {

			const EUC = global.SixCRM.routes.include('controllers','entities/EntityUtilities.js');
			let entityUtilitiesController = new EUC();

			expect(entityUtilitiesController.transformListArray(['a', 'b', '', 'c'])).to.deep.equal(['a', 'b', 'c']);
		});

		it('returns null when list array is empty', () => {

			const EUC = global.SixCRM.routes.include('controllers','entities/EntityUtilities.js');
			let entityUtilitiesController = new EUC();

			expect(entityUtilitiesController.transformListArray([])).to.deep.equal(null);
		});

		it('returns null when list array contains empty strings', () => {

			const EUC = global.SixCRM.routes.include('controllers','entities/EntityUtilities.js');
			let entityUtilitiesController = new EUC();

			expect(entityUtilitiesController.transformListArray(['', '', ''])).to.deep.equal(null);
		});
	});

	describe('getResult', () => {

		it('retrieves field if specified object contains such key', () => {

			const EUC = global.SixCRM.routes.include('controllers','entities/EntityUtilities.js');
			let entityUtilitiesController = new EUC();

			return entityUtilitiesController.getResult({a_field: 'any_value'}, 'a_field').then((result) => {
				expect(result).to.deep.equal('any_value');
			});
		});

		it('retrieves value object if object contains a key equal to descriptive name', () => {

			const EUC = global.SixCRM.routes.include('controllers','entities/EntityUtilities.js');
			let entityUtilitiesController = new EUC();

			entityUtilitiesController.descriptive_name = 'any_name';

			return entityUtilitiesController.getResult({any_names: 'any_value'}).then((result) => {
				expect(result).to.deep.equal('any_value');
			});
		});

		it('returns null when specified object does not contain a key equal to specified field', () => {

			const EUC = global.SixCRM.routes.include('controllers','entities/EntityUtilities.js');
			let entityUtilitiesController = new EUC();

			return entityUtilitiesController.getResult({any_name: 'any_value'}, 'a_field').then((result) => {
				expect(result).to.deep.equal(null);
			});
		});
	});

	describe('buildResponse', () => {

		it('build response', () => {

			let data = {
				Items: ['any_item'],
				Count: 1,
				LastEvaluatedKey: {id: 'dummy_id'}
			};

			const EUC = global.SixCRM.routes.include('controllers','entities/EntityUtilities.js');
			let entityUtilitiesController = new EUC();

			entityUtilitiesController.descriptive_name = 'a_name';
			entityUtilitiesController.setPrimaryKey();
			entityUtilitiesController.censorEncryptedAttributes = () => {};

			expect(entityUtilitiesController.buildResponse(data)).to.deep.equal({
				a_names: data.Items,
				pagination: {
					count: 1,
					end_cursor: "dummy_id",
					has_next_page: "true",
					last_evaluated: "{\"id\":\"dummy_id\"}"
				},
			});
		});

		it('censors attributes when sanitize=true', () => {
			const data = {
				Items: ['encrypted_item'],
				Count: 1,
				LastEvaluatedKey: {id: 'dummy_id'}
			};

			const censored_items = ['censored_item'];

			const EUC = global.SixCRM.routes.include('controllers','entities/EntityUtilities.js');
			const entityUtilitiesController = new EUC();

			entityUtilitiesController.descriptive_name = 'a_name';
			entityUtilitiesController.setPrimaryKey();
			entityUtilitiesController.censorEncryptedAttributes = () => {
				data.Items = censored_items;
			}

			expect(entityUtilitiesController.buildResponse(data)).to.deep.equal({
				a_names: censored_items,
				pagination: {
					count: 1,
					end_cursor: "dummy_id",
					has_next_page: "true",
					last_evaluated: "{\"id\":\"dummy_id\"}"
				},
			});
		});

		it('decrypts attributes when sanitize=false', () => {
			const data = {
				Items: ['encrypted_item'],
				Count: 1,
				LastEvaluatedKey: {id: 'dummy_id'}
			};

			const unencrypted_items = ['item'];

			const EUC = global.SixCRM.routes.include('controllers','entities/EntityUtilities.js');
			const entityUtilitiesController = new EUC();

			entityUtilitiesController.descriptive_name = 'a_name';
			entityUtilitiesController.setPrimaryKey();
			entityUtilitiesController.sanitization = false;
			entityUtilitiesController.decryptAttributes = () => {
				data.Items = unencrypted_items;
			}

			expect(entityUtilitiesController.buildResponse(data)).to.deep.equal({
				a_names: unencrypted_items,
				pagination: {
					count: 1,
					end_cursor: "dummy_id",
					has_next_page: "true",
					last_evaluated: "{\"id\":\"dummy_id\"}"
				},
			});
		});

		it('returns data when "Items" are undefined', () => {

			let data = {
				Count: 1,
				LastEvaluatedKey: {id: 'dummy_id'}
			};

			const EUC = global.SixCRM.routes.include('controllers','entities/EntityUtilities.js');
			let entityUtilitiesController = new EUC();

			expect(entityUtilitiesController.buildResponse(data)).to.deep.equal(data);
		});

		it('builds response when "Items" are null', () => {

			let data = {
				Items: [],
				Count: 1,
				LastEvaluatedKey: {id: 'dummy_id'}
			};

			const EUC = global.SixCRM.routes.include('controllers','entities/EntityUtilities.js');
			let entityUtilitiesController = new EUC();

			entityUtilitiesController.descriptive_name = 'a_name';
			entityUtilitiesController.setPrimaryKey();

			expect(entityUtilitiesController.buildResponse(data)).to.deep.equal({
				a_names: data.Items,
				pagination: {
					count: 1,
					end_cursor: "dummy_id",
					has_next_page: "true",
					last_evaluated: "{\"id\":\"dummy_id\"}"
				},
			});
		});
	});

	describe('buildPaginationObject', () => {

		it('builds pagination object', () => {

			let data = {
				Count: 1,
				LastEvaluatedKey: {id: 'dummy_id'}
			};

			const EUC = global.SixCRM.routes.include('controllers','entities/EntityUtilities.js');
			let entityUtilitiesController = new EUC();

			entityUtilitiesController.setPrimaryKey();

			expect(entityUtilitiesController.buildPaginationObject(data)).to.deep.equal({
				count: 1,
				end_cursor: "dummy_id",
				has_next_page: "true",
				last_evaluated: "{\"id\":\"dummy_id\"}"
			});
		});
	});

	describe('appendAccountCondition', () => {

		it('appends account condition', () => {

			let query_params = {
				query_parameters:
                    {
                    	key_condition_expression:['a_key_condition_expression']
                    },
				account:'any_string'
			};

			const EUC = global.SixCRM.routes.include('controllers','entities/EntityUtilities.js');
			let entityUtilitiesController = new EUC();

			expect(entityUtilitiesController.appendAccountCondition(query_params)).to.deep.equal({
				expression_attribute_names: {
					"#account": "account"
				},
				expression_attribute_values: {
					":accountv": "any_string"
				},
				key_condition_expression: "#account = :accountv"
			});
		});
	});

	describe('buildTableKey', () => {

		it('successfully builds table key', () => {

			let a_name = 'any_name';

			const EUC = global.SixCRM.routes.include('controllers','entities/EntityUtilities.js');
			let entityUtilitiesController = new EUC();

			expect(entityUtilitiesController.buildTableKey(a_name))
				.to.equal('any_names_table');
		});
	});

	describe('buildTableName', () => {

		it('successfully builds table name', () => {

			let a_name = 'any_name';

			const EUC = global.SixCRM.routes.include('controllers','entities/EntityUtilities.js');
			let entityUtilitiesController = new EUC();

			expect(entityUtilitiesController.buildTableName(a_name))
				.to.equal('any_names');
		});
	});

	describe('setEnvironmentTableName', () => {

		it('successfully sets environment table name', () => {

			let a_name = 'any_name';

			const EUC = global.SixCRM.routes.include('controllers','entities/EntityUtilities.js');
			let entityUtilitiesController = new EUC();

			entityUtilitiesController.setEnvironmentTableName(a_name);

			expect(process.env['any_names_table']).to.equal('any_names');
		});
	});

	describe('setTableName', () => {

		it('successfully sets table name', () => {

			let a_name = 'any_name';

			const EUC = global.SixCRM.routes.include('controllers','entities/EntityUtilities.js');
			let entityUtilitiesController = new EUC();

			entityUtilitiesController.setEnvironmentTableName(a_name); //prepare process.env

			entityUtilitiesController.setTableName(a_name);

			expect(entityUtilitiesController.table_name).to.equal('any_names');
		});
	});

	describe('setNames', () => {

		it('successfully sets table name', () => {

			let a_name = 'any_name';

			const EUC = global.SixCRM.routes.include('controllers','entities/EntityUtilities.js');
			let entityUtilitiesController = new EUC();

			entityUtilitiesController.setNames(a_name);

			expect(entityUtilitiesController.descriptive_name).to.equal('any_name');
			expect(entityUtilitiesController.table_name).to.equal('any_names');
			expect(process.env['any_names_table']).to.equal('any_names');
		});
	});

	describe('setPrimaryKey', () => {

		it('successfully sets primary key', () => {

			const EUC = global.SixCRM.routes.include('controllers','entities/EntityUtilities.js');
			let entityUtilitiesController = new EUC();

			entityUtilitiesController.setPrimaryKey();

			expect(entityUtilitiesController.primary_key).to.equal('id');
		});
	});

	describe('appendPagination', () => {

		it('successfully appends limit without query parameters', () => {

			let params = {
				pagination: {
					limit: 5 //any number between 1 and 100 for limit
				}
			};

			const EUC = global.SixCRM.routes.include('controllers','entities/EntityUtilities.js');
			let entityUtilitiesController = new EUC();



			expect(entityUtilitiesController.appendPagination(params)).to.deep.equal(params.pagination);
		});

		it('successfully appends limit with query parameters', () => {

			let params = {
				query_parameters: {
					any_params: 'any_params'
				},
				pagination: {
					limit: 5 //any number between 1 and 100 for limit
				}
			};

			const EUC = global.SixCRM.routes.include('controllers','entities/EntityUtilities.js');
			let entityUtilitiesController = new EUC();

			expect(entityUtilitiesController.appendPagination(params)).to.deep.equal({
				any_params: params.query_parameters.any_params,
				limit: params.pagination.limit
			});
		});

		it('successfully appends exclusive start key', () => {

			let params = {
				query_parameters: {
					any_params: 'any_params'
				},
				pagination: {
					exclusive_start_key: 'test@example.com'
				}
			};

			const EUC = global.SixCRM.routes.include('controllers','entities/EntityUtilities.js');
			let entityUtilitiesController = new EUC();

			expect(entityUtilitiesController.appendPagination(params)).to.deep.equal({
				ExclusiveStartKey: "test@example.com",
				any_params: params.query_parameters.any_params
			});
		});

		it('successfully appends exclusive start key', () => {

			let params = {
				query_parameters: {
					any_params: 'any_params'
				},
				pagination: {
					cursor: 'test@example.com'
				}
			};

			const EUC = global.SixCRM.routes.include('controllers','entities/EntityUtilities.js');
			let entityUtilitiesController = new EUC();

			expect(entityUtilitiesController.appendPagination(params)).to.deep.equal({
				ExclusiveStartKey: {
					id:"test@example.com"
				},
				any_params: params.query_parameters.any_params
			});
		});

		it('returns unchanged query parameters when pagination is undefined', () => {

			let params = {
				query_parameters: {
					any_params: 'any_params'
				}
			};

			const EUC = global.SixCRM.routes.include('controllers','entities/EntityUtilities.js');
			let entityUtilitiesController = new EUC();

			expect(entityUtilitiesController.appendPagination(params)).to.deep.equal(params.query_parameters);
		});
	});

	describe('appendCursor', () => {

		it('appends cursor when cursor is an email', () => {

			let query_parameters = {
				any_params: 'any_params'
			};

			let cursor = 'test@example.com';

			const EUC = global.SixCRM.routes.include('controllers','entities/EntityUtilities.js');
			let entityUtilitiesController = new EUC();

			expect(entityUtilitiesController.appendCursor(query_parameters, cursor)).to.deep.equal({
				any_params: query_parameters.any_params,
				ExclusiveStartKey: {
					id: cursor
				}
			});
		});

		it('appends cursor when cursor is a uuid4', () => {

			let query_parameters = {
				any_params: 'any_params'
			};

			let cursor = 'aaaaaaaa-aaaa-4aaa-aaaa-aaaaaaaaaaaa';

			const EUC = global.SixCRM.routes.include('controllers','entities/EntityUtilities.js');
			let entityUtilitiesController = new EUC();

			expect(entityUtilitiesController.appendCursor(query_parameters, cursor)).to.deep.equal({
				any_params: query_parameters.any_params,
				ExclusiveStartKey: {
					id: cursor
				}
			});
		});

		it('appends cursor when cursor is a "*"', () => {

			let query_parameters = {
				any_params: 'any_params'
			};

			let cursor = '*';

			const EUC = global.SixCRM.routes.include('controllers','entities/EntityUtilities.js');
			let entityUtilitiesController = new EUC();

			expect(entityUtilitiesController.appendCursor(query_parameters, cursor)).to.deep.equal({
				any_params: query_parameters.any_params,
				ExclusiveStartKey: {
					id: cursor
				}
			});
		});

		it('successfully parses and appends cursor', () => {

			let query_parameters = {
				any_params: 'any_params'
			};

			let cursor = '{ "test": "test@example.com"}';

			const EUC = global.SixCRM.routes.include('controllers','entities/EntityUtilities.js');
			let entityUtilitiesController = new EUC();

			expect(entityUtilitiesController.appendCursor(query_parameters, cursor)).to.deep.equal({
				any_params: query_parameters.any_params,
				ExclusiveStartKey: {
					test: "test@example.com"
				}
			});
		});

		it('throws error when format is unrecognized', () => {

			let query_parameters = {
				any_params: 'any_params'
			};

			let cursors = ['example', '123', '{}', '[]', '-123', '3xampl3']; //unexpected strings format

			const EUC = global.SixCRM.routes.include('controllers','entities/EntityUtilities.js');
			let entityUtilitiesController = new EUC();

			cursors.forEach(cursor => {
				try{
					entityUtilitiesController.appendCursor(query_parameters, cursor)
				}catch(error) {
					expect(error.message).to.equal('[500] Unrecognized format for Exclusive Start Key.');
				}
			});
		});

		it('throws error when cursor is not a string', () => {

			let query_parameters = {
				any_params: 'any_params'
			};

			let cursors = [{}, [], () => {}, 123, 123.123, -123, -123.123]; //unexpected format

			const EUC = global.SixCRM.routes.include('controllers','entities/EntityUtilities.js');
			let entityUtilitiesController = new EUC();

			cursors.forEach(cursor => {
				try{
					entityUtilitiesController.appendCursor(query_parameters, cursor)
				}catch(error) {
					expect(error.message).to.equal('[500] Unrecognized format for Cursor.');
				}
			});
		});

		it('returns unchanged query parameters when cursor is undefined', () => {

			let query_parameters = {
				any_params: 'any_params'
			};

			const EUC = global.SixCRM.routes.include('controllers','entities/EntityUtilities.js');
			let entityUtilitiesController = new EUC();

			expect(entityUtilitiesController.appendCursor(query_parameters)).to.deep.equal(query_parameters);
		});
	});

	describe('appendExclusiveStartKey', () => {

		it('appends exclusive start key when it\'s an email', () => {

			let query_parameters = {
				any_params: 'any_params'
			};

			let exclusive_start_key = 'test@example.com';

			const EUC = global.SixCRM.routes.include('controllers', 'entities/EntityUtilities.js');
			let entityUtilitiesController = new EUC();

			expect(entityUtilitiesController.appendExclusiveStartKey(query_parameters, exclusive_start_key)).to.deep.equal({
				any_params: query_parameters.any_params,
				ExclusiveStartKey: exclusive_start_key
			});
		});

		it('appends exclusive start key when it\'s an uuid', () => {

			let query_parameters = {
				any_params: 'any_params'
			};

			let exclusive_start_key = 'aaaaaaaa-aaaa-4aaa-aaaa-aaaaaaaaaaaa';

			const EUC = global.SixCRM.routes.include('controllers', 'entities/EntityUtilities.js');
			let entityUtilitiesController = new EUC();

			expect(entityUtilitiesController.appendExclusiveStartKey(query_parameters, exclusive_start_key)).to.deep.equal({
				any_params: query_parameters.any_params,
				ExclusiveStartKey: exclusive_start_key
			});
		});

		it('parses and appends exclusive start key', () => {

			let query_parameters = {
				any_params: 'any_params'
			};

			let exclusive_start_key = '{ "test": "test@example.com"}';

			const EUC = global.SixCRM.routes.include('controllers', 'entities/EntityUtilities.js');
			let entityUtilitiesController = new EUC();

			expect(entityUtilitiesController.appendExclusiveStartKey(query_parameters, exclusive_start_key)).to.deep.equal({
				any_params: query_parameters.any_params,
				ExclusiveStartKey: {
					test: "test@example.com"
				}
			});
		});

		it('parses and appends exclusive start key when there is an accountv property', () => {

			let query_parameters = {
				any_params: 'any_params',
				expression_attribute_values: {':accountv': 'testaccount'}
			};

			let exclusive_start_key = '{ "test": "test@example.com"}';

			const EUC = global.SixCRM.routes.include('controllers', 'entities/EntityUtilities.js');
			let entityUtilitiesController = new EUC();

			expect(entityUtilitiesController.appendExclusiveStartKey(query_parameters, exclusive_start_key)).to.deep.equal({
				any_params: query_parameters.any_params,
				expression_attribute_values: {':accountv': 'testaccount'},
				ExclusiveStartKey: {
					test: "test@example.com",
					account: "testaccount"
				}
			});
		});

		it('returns unchanged query parameters when exclusive start key is undefined', () => {

			let query_parameters = {
				any_params: 'any_params'
			};

			const EUC = global.SixCRM.routes.include('controllers', 'entities/EntityUtilities.js');
			let entityUtilitiesController = new EUC();

			expect(entityUtilitiesController.appendExclusiveStartKey(query_parameters))
				.to.deep.equal(query_parameters);
		});

		it('parses and appends exclusive start key', () => {

			let query_parameters = {
				any_params: 'any_params'
			};

			let exclusive_start_keys = [{}, [], () => {}, 123, 123.123, -123, -123.123]; //unexpected format

			const EUC = global.SixCRM.routes.include('controllers', 'entities/EntityUtilities.js');
			let entityUtilitiesController = new EUC();

			exclusive_start_keys.forEach(exclusive_start_key => {
				try {
					entityUtilitiesController.appendExclusiveStartKey(query_parameters, exclusive_start_key)
				}catch(error) {
					expect(error.message).to.equal('[400] Unrecognized Exclusive Start Key format.');
				}
			});
		});
	});

	describe('appendSearchConditions', () => {

		it('appends search conditions with "updated_at.after"', () => {

			let params = {
				query_parameters: {
					expression_attribute_names: {}
				},
				search: {
					updated_at: {
						after: ['any_data']
					}
				}
			};

			const EUC = global.SixCRM.routes.include('controllers', 'entities/EntityUtilities.js');
			let entityUtilitiesController = new EUC();

			expect(entityUtilitiesController.appendSearchConditions(params)).to.deep.equal({
				expression_attribute_names: {
					"#updated_at_after_k": "updated_at"
				},
				expression_attribute_values: {
					":updated_at_after_v": ["any_data"]
				},
				filter_expression: "#updated_at_after_k > :updated_at_after_v"
			});
		});

		it('appends search conditions with "updated_at.before"', () => {

			let params = {
				query_parameters: {
					expression_attribute_names: {}
				},
				search: {
					updated_at: {
						before: ['any_data']
					}
				}
			};

			const EUC = global.SixCRM.routes.include('controllers', 'entities/EntityUtilities.js');
			let entityUtilitiesController = new EUC();

			expect(entityUtilitiesController.appendSearchConditions(params)).to.deep.equal({
				expression_attribute_names: {
					"#updated_at_before_k": "updated_at"
				},
				expression_attribute_values: {
					":updated_at_before_v": ["any_data"]
				},
				filter_expression: "#updated_at_before_k < :updated_at_before_v"
			});
		});

		it('appends search conditions with "created_at.after"', () => {

			let params = {
				query_parameters: {
					expression_attribute_names: {}
				},
				search: {
					created_at: {
						after: ['any_data']
					}
				}
			};

			const EUC = global.SixCRM.routes.include('controllers', 'entities/EntityUtilities.js');
			let entityUtilitiesController = new EUC();

			expect(entityUtilitiesController.appendSearchConditions(params)).to.deep.equal({
				expression_attribute_names: {
					"#created_at_after_k": "created_at"
				},
				expression_attribute_values: {
					":created_at_after_v": ["any_data"]
				},
				filter_expression: "#created_at_after_k > :created_at_after_v"
			});
		});

		it('appends search conditions with "created_at.before"', () => {

			let params = {
				query_parameters: {
					expression_attribute_names: {}
				},
				search: {
					created_at: {
						before: ['any_data']
					}
				}
			};

			const EUC = global.SixCRM.routes.include('controllers', 'entities/EntityUtilities.js');
			let entityUtilitiesController = new EUC();

			expect(entityUtilitiesController.appendSearchConditions(params)).to.deep.equal({
				expression_attribute_names: {
					"#created_at_before_k": "created_at"
				},
				expression_attribute_values: {
					":created_at_before_v": ["any_data"]
				},
				filter_expression: "#created_at_before_k < :created_at_before_v"
			});
		});

		it('does not append search conditions with "name" if no search field is defined', () => {

			let params = {
				query_parameters: {},
				search: {name: 'some_name'}
			};

			const EUC = global.SixCRM.routes.include('controllers', 'entities/EntityUtilities.js');
			let entityUtilitiesController = new EUC();

			expect(entityUtilitiesController.appendSearchConditions(params)).to.deep.equal({});
		});

		it('does not append search conditions with "name" if search field is not an array', () => {

			let params = {
				query_parameters: {},
				search: {name: 'some_name'}
			};

			const EUC = global.SixCRM.routes.include('controllers', 'entities/EntityUtilities.js');
			let entityUtilitiesController = new EUC();

			entityUtilitiesController.search_fields = 'test';

			expect(entityUtilitiesController.appendSearchConditions(params)).to.deep.equal({});
		});

		it('does not append search conditions with "name" if search field is an empty array', () => {

			let params = {
				query_parameters: {},
				search: {name: 'some_name'}
			};

			const EUC = global.SixCRM.routes.include('controllers', 'entities/EntityUtilities.js');
			let entityUtilitiesController = new EUC();

			entityUtilitiesController.search_fields = 'test';

			expect(entityUtilitiesController.appendSearchConditions(params)).to.deep.equal({});
		});

		it('does not append search conditions with "name" if search name value is undefined', () => {

			let params = {
				query_parameters: {},
				search: {name: ''}
			};

			const EUC = global.SixCRM.routes.include('controllers', 'entities/EntityUtilities.js');
			let entityUtilitiesController = new EUC();

			entityUtilitiesController.search_fields = ['something'];

			expect(entityUtilitiesController.appendSearchConditions(params)).to.deep.equal({});
		});

		it('does not append search conditions with "name" if search name is undefined', () => {

			let params = {
				query_parameters: {},
				search: {}
			};

			const EUC = global.SixCRM.routes.include('controllers', 'entities/EntityUtilities.js');
			let entityUtilitiesController = new EUC();

			entityUtilitiesController.search_fields = ['something'];

			expect(entityUtilitiesController.appendSearchConditions(params)).to.deep.equal({});
		});

		it('does not append search conditions with "name" if search is undefined', () => {

			let params = {
				query_parameters: {},
			};

			const EUC = global.SixCRM.routes.include('controllers', 'entities/EntityUtilities.js');
			let entityUtilitiesController = new EUC();

			entityUtilitiesController.search_fields = ['something'];

			expect(entityUtilitiesController.appendSearchConditions(params)).to.deep.equal({});
		});

		it('appends search conditions with "name" if search field is defined', () => {

			let params = {
				query_parameters: {},
				search: {name: 'some_value'}
			};

			const EUC = global.SixCRM.routes.include('controllers', 'entities/EntityUtilities.js');
			let entityUtilitiesController = new EUC();

			entityUtilitiesController.search_fields = ['name'];

			expect(entityUtilitiesController.appendSearchConditions(params)).to.deep.equal({
				expression_attribute_names: {
					"#search_name": "name"
				},
				expression_attribute_values: {
					":name_v": "some_value"
				},
				filter_expression: "contains(#search_name, :name_v)"
			});
		});

		it('appends search conditions with "name" if multiple search fields are defined', () => {

			let params = {
				query_parameters: {},
				search: {name: 'some_value'}
			};

			const EUC = global.SixCRM.routes.include('controllers', 'entities/EntityUtilities.js');
			let entityUtilitiesController = new EUC();

			entityUtilitiesController.search_fields = ['name', 'other'];

			expect(entityUtilitiesController.appendSearchConditions(params)).to.deep.equal({
				expression_attribute_names: {
					"#search_name": "name",
					"#search_other": "other"
				},
				expression_attribute_values: {
					":name_v": "some_value",
					":other_v": "some_value"
				},
				filter_expression: "contains(#search_name, :name_v) OR contains(#search_other, :other_v)"
			});
		});
	});
});
