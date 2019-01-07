let chai = require('chai');
let expect = chai.expect;
const mockery = require('mockery');
let PermissionTestGenerators = global.SixCRM.routes.include('test', 'unit/lib/permission-test-generators');
const MockEntities = global.SixCRM.routes.include('test', 'mock-entities.js');

function getValidUserSigningString() {
	return MockEntities.getValidUserSigningString()
}

describe('controllers/UserSigningString.js', () => {

	before(() => {
		mockery.enable({
			useCleanCache: true,
			warnOnReplace: false,
			warnOnUnregistered: false
		});
	});

	afterEach(() => {
		mockery.resetCache();
		mockery.deregisterAll();
	});

	after(() => {
		mockery.disable();
	});

	describe('create', () => {

		it('creates user signing string', () => {
			let user_signing_string = getValidUserSigningString();

			PermissionTestGenerators.givenUserWithAllowed('create', 'usersigningstring');

			mockery.registerMock(global.SixCRM.routes.path('controllers', 'providers/dynamodb-provider.js'), class {
				queryRecords(table, parameters) {
					expect(table).to.equal('usersigningstrings');
					expect(parameters).to.have.property('key_condition_expression');
					expect(parameters).to.have.property('expression_attribute_values');
					expect(parameters.expression_attribute_values[':primary_keyv']).to.equal(user_signing_string.id);
					return Promise.resolve([]);
				}
				saveRecord(tableName, entity) {
					expect(tableName).to.equal('usersigningstrings');
					expect(entity).to.deep.equal(user_signing_string);
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

			const UserSigningStringController = global.SixCRM.routes.include('controllers', 'entities/UserSigningString');
			let userSigningStringController = new UserSigningStringController();

			return userSigningStringController.create({entity: user_signing_string}).then((result) => {
				expect(result).to.deep.equal(user_signing_string);
			});
		});

		it('generates and creates user signing string', () => {

			let user_signing_string = getValidUserSigningString();

			delete user_signing_string.signing_string;

			PermissionTestGenerators.givenUserWithAllowed('create', 'usersigningstring');

			mockery.registerMock(global.SixCRM.routes.path('controllers', 'providers/dynamodb-provider.js'), class {
				queryRecords(table, parameters) {
					expect(table).to.equal('usersigningstrings');
					expect(parameters).to.have.property('key_condition_expression');
					expect(parameters).to.have.property('expression_attribute_values');
					expect(parameters.expression_attribute_values[':primary_keyv']).to.equal(user_signing_string.id);
					return Promise.resolve([]);
				}
				saveRecord(tableName, entity) {
					expect(tableName).to.equal('usersigningstrings');
					expect(entity).to.deep.equal(user_signing_string);
					return Promise.resolve(entity);
				}
			});

			let mock_preindexing_helper = class {
				constructor(){}
			};

			mockery.registerMock(global.SixCRM.routes.path('helpers', 'indexing/PreIndexing.js'), mock_preindexing_helper);

			mockery.registerMock(global.SixCRM.routes.path('helpers', 'analytics/Activity.js'), class {
				createActivity() {
					return Promise.resolve();
				}
			});

			const UserSigningStringController = global.SixCRM.routes.include('controllers', 'entities/UserSigningString');
			let userSigningStringController = new UserSigningStringController();

			return userSigningStringController.create({entity: user_signing_string}).then((result) => {
				expect(result).to.deep.equal(user_signing_string);
			});
		});
	});

	describe('update', () => {

		it('updates user signing string', () => {
			let user_signing_string = getValidUserSigningString();

			PermissionTestGenerators.givenUserWithAllowed('*', 'usersigningstring');

			mockery.registerMock(global.SixCRM.routes.path('controllers', 'providers/dynamodb-provider.js'), class {
				queryRecords(table, parameters) {
					expect(table).to.equal('usersigningstrings');
					expect(parameters).to.have.property('key_condition_expression');
					expect(parameters).to.have.property('expression_attribute_values');
					expect(parameters.expression_attribute_values[':primary_keyv']).to.equal(user_signing_string.id);
					return Promise.resolve({
						Count: 1,
						Items: [user_signing_string]
					});
				}
				saveRecord(tableName, entity) {
					expect(tableName).to.equal('usersigningstrings');
					expect(entity).to.deep.equal(user_signing_string);
					return Promise.resolve(entity);
				}
			});

			let mock_preindexing_helper = class {
				constructor(){}
			};

			mockery.registerMock(global.SixCRM.routes.path('helpers', 'indexing/PreIndexing.js'), mock_preindexing_helper);

			mockery.registerMock(global.SixCRM.routes.path('helpers', 'analytics/Activity.js'), class {
				createActivity() {
					return Promise.resolve();
				}
			});

			const UserSigningStringController = global.SixCRM.routes.include('controllers', 'entities/UserSigningString');
			let userSigningStringController = new UserSigningStringController();

			return userSigningStringController.update({entity: user_signing_string}).then((result) => {
				expect(result).to.deep.equal(user_signing_string);
			});
		});
	});
});
