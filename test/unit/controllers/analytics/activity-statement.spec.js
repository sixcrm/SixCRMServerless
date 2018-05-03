let chai = require('chai');
let expect = chai.expect;
const mockery = require('mockery');
let PermissionTestGenerators = global.SixCRM.routes.include('test', 'unit/lib/permission-test-generators');

describe('controllers/ActivityToEnglishUtilities.js', async () => {

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

	describe('setEnglishTemplate', () => {

		it('successfully gets english template with "actor_only"', () => {

			let ActivityToEnglishUtilitiesController = global.SixCRM.routes.include('controllers', 'analytics/activity-statement.js');
			let aceuController = new ActivityToEnglishUtilitiesController({});

			const result = aceuController._englishTemplate([{
				type: 'actor_only',
			}]);
			expect(result).to.equal(aceuController.statement_templates.actor_only);

		});

	});

	describe('buildObject', () => {

		it('successfully builds object', () => {

			const ActivityToEnglishUtilitiesController = global.SixCRM.routes.include('controllers', 'analytics/activity-statement.js');
			const aceuController = new ActivityToEnglishUtilitiesController();

			const result = aceuController._buildObject(aceuController._englishTemplate([{
				type: 'actor_only',
			}]), ['an_actor', 'an_acted_upon_data', 'an_associated_with']);

			expect(result).to.eql({
				actor: 'an_actor',
				acted_upon: 'an_acted_upon_data',
				associated_with: 'an_associated_with',
				english_template: '{actor} {action}.'
			});

		});

	});

	describe('get', async () => {

		const dummy_id = 'aaaaaaaa-aaaa-4aaa-aaaa-aaaaaaaaaaaa';

		it('returns when type of activity row exists', () => {

			PermissionTestGenerators.givenUserWithAllowed('read', 'entity');

			mockery.registerMock(global.SixCRM.routes.path('controllers', 'providers/dynamodb-provider.js'), class {
				queryRecords(table, parameters) {
					expect(table).to.equal('entities');
					expect(parameters).to.have.property('filter_expression');
					expect(parameters).to.have.property('key_condition_expression');
					expect(parameters).to.have.property('expression_attribute_values');
					expect(parameters.expression_attribute_values[':primary_keyv']).to.equal(dummy_id);
					return Promise.resolve({
						Items: [{
							id: dummy_id
						}]
					});
				}
			});

			const ActivityToEnglishUtilitiesController = global.SixCRM.routes.include('controllers', 'analytics/activity-statement.js');
			const aceuController = new ActivityToEnglishUtilitiesController();

			return aceuController._get('test', {
				test: dummy_id,
				test_type: 'entity'
			});

		});

		it('returns null when type of activity row does not exists', async () => {

			const ActivityToEnglishUtilitiesController = global.SixCRM.routes.include('controllers', 'analytics/activity-statement.js');
			const aceuController = new ActivityToEnglishUtilitiesController();

			const result = await aceuController._get('test', {
				test_type: 'entity'
			});

			expect(result).to.equal(null);

		});

		it('returns system object when activity row type is system', async () => {

			let ActivityToEnglishUtilitiesController = global.SixCRM.routes.include('controllers', 'analytics/activity-statement.js');
			let aceuController = new ActivityToEnglishUtilitiesController();

			const result = await aceuController._get('test', {
				test: 'system'
			});

			expect(result).to.to.deep.equal({
				id: 'system',
				name: 'SixCRM'
			});

		});

		it('returns when type is successfully set', () => {

			PermissionTestGenerators.givenUserWithAllowed('read', 'entity');

			mockery.registerMock(global.SixCRM.routes.path('controllers', 'providers/dynamodb-provider.js'), class {
				queryRecords(table, parameters) {
					expect(table).to.equal('entities');
					expect(parameters).to.have.property('filter_expression');
					expect(parameters).to.have.property('key_condition_expression');
					expect(parameters).to.have.property('expression_attribute_values');
					expect(parameters.expression_attribute_values[':primary_keyv']).to.equal(dummy_id);
					return Promise.resolve({
						Items: [{}]
					});
				}
			});

			let ActivityToEnglishUtilitiesController = global.SixCRM.routes.include('controllers', 'analytics/activity-statement.js');
			let aceuController = new ActivityToEnglishUtilitiesController();

			aceuController.activity_row = {
				test: dummy_id,
				test_type: 'entity'
			};

			return aceuController._get('test');

		});

		it('throws when entity retrieval failed', async () => {

			let dummy_id = 'aaaaaaaa-aaaa-4aaa-aaaa-aaaaaaaaaaaa';

			PermissionTestGenerators.givenUserWithAllowed('read', 'entity');

			mockery.registerMock(global.SixCRM.routes.path('controllers', 'providers/dynamodb-provider.js'), class {
				queryRecords(table, parameters) {
					expect(table).to.equal('entities');
					expect(parameters).to.have.property('filter_expression');
					expect(parameters).to.have.property('key_condition_expression');
					expect(parameters).to.have.property('expression_attribute_values');
					expect(parameters.expression_attribute_values[':primary_keyv']).to.equal(dummy_id);
					return Promise.reject(new Error('Failed to retrieve an entity'));
				}
			});

			let ActivityToEnglishUtilitiesController = global.SixCRM.routes.include('controllers', 'analytics/activity-statement.js');
			let aceuController = new ActivityToEnglishUtilitiesController({});

			aceuController.activity_row = {
				test: dummy_id,
				test_type: 'entity'
			};

			try {

				await aceuController._get('test', {
					test: dummy_id,
					test_type: 'entity'
				});

			} catch (ex) {

				return expect(ex.message).to.equal('[500] Error: Failed to retrieve an entity');

			}

			throw new Error('should not get here');

		});

	});

	describe('gets resources', async () => {

		const dummy_id = 'aaaaaaaa-aaaa-4aaa-aaaa-aaaaaaaaaaaa';

		beforeEach(() => {

			PermissionTestGenerators.givenUserWithAllowed('read', 'entity');

			mockery.registerMock(global.SixCRM.routes.path('controllers', 'providers/dynamodb-provider.js'), class {
				queryRecords(table, parameters) {
					expect(table).to.equal('entities');
					expect(parameters).to.have.property('filter_expression');
					expect(parameters).to.have.property('key_condition_expression');
					expect(parameters).to.have.property('expression_attribute_values');
					expect(parameters.expression_attribute_values[':primary_keyv']).to.equal(dummy_id);
					return Promise.resolve({
						Items: [{
							id: dummy_id
						}]
					});
				}
			});
		});

		it('successfully retrieves an entity', async () => {

			const ActivityToEnglishUtilitiesController = global.SixCRM.routes.include('controllers', 'analytics/activity-statement.js');
			const aceuController = new ActivityToEnglishUtilitiesController({});

			const result = await aceuController._getEntity({
				id: 'aaaaaaaa-aaaa-4aaa-aaaa-aaaaaaaaaaaa',
				type: 'entity'
			});

			expect(result).to.deep.equal({
				id: 'aaaaaaaa-aaaa-4aaa-aaaa-aaaaaaaaaaaa'
			});

		});

		it('successfully acquires resources', () => {

			const ActivityToEnglishUtilitiesController = global.SixCRM.routes.include('controllers', 'analytics/activity-statement.js');
			const aceuController = new ActivityToEnglishUtilitiesController({});

			return aceuController._acquireResources({
				actor: dummy_id,
				actor_type: 'entity',
				acted_upon: dummy_id,
				acted_upon_type: 'entity',
				associated_with: dummy_id,
				associated_with_type: 'entity'
			});

		});

	});

	describe('builds/appends activity english object', async () => {

		const dummy_id = 'aaaaaaaa-aaaa-4aaa-aaaa-aaaaaaaaaaaa';

		const statement = {
			"actor": {
				"id": dummy_id,
			},
			"acted_upon": {
				"id": dummy_id,
			},
			"associated_with": {
				"id": dummy_id,
			},
			"english_template": "{actor} {action} {acted_upon} associated with {associated_with}."
		};

		beforeEach(() => {

			PermissionTestGenerators.givenUserWithAllowed('read', 'entity');

			mockery.registerMock(global.SixCRM.routes.path('controllers', 'providers/dynamodb-provider.js'), class {
				queryRecords(table, parameters) {
					expect(table).to.equal('entities');
					expect(parameters).to.have.property('filter_expression');
					expect(parameters).to.have.property('key_condition_expression');
					expect(parameters).to.have.property('expression_attribute_values');
					expect(parameters.expression_attribute_values[':primary_keyv']).to.equal(dummy_id);
					return Promise.resolve({
						Items: [{
							id: dummy_id
						}]
					});
				}
			});
		});

		it('builds activity english object', async () => {

			const ActivityToEnglishUtilitiesController = global.SixCRM.routes.include('controllers', 'analytics/activity-statement.js');
			const aceuController = new ActivityToEnglishUtilitiesController();

			const result = await aceuController.buildActivityEnglishObject({
				actor: dummy_id,
				actor_type: 'entity',
				acted_upon: dummy_id,
				acted_upon_type: 'entity',
				associated_with: dummy_id,
				associated_with_type: 'entity'
			});

			expect(result).to.eql(statement);

		});

	});

});
