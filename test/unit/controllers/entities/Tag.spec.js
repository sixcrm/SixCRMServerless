const chai = require('chai');
const expect = chai.expect;
const mockery = require('mockery');
const PermissionTestGenerators = global.SixCRM.routes.include('test', 'unit/lib/permission-test-generators');

describe('controllers/entities/Tag.js', () => {
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

	describe('listByKey', () => {
		it('returns list of tags matching key', () => {
			const entities = [{
				id: '',
				account: '',
				key: 'Test Key',
				value: 'yes'
			}];

			PermissionTestGenerators.givenUserWithAllowed('read', 'tag');

			mockery.registerMock(global.SixCRM.routes.path('controllers', 'providers/dynamodb-provider.js'), class {
				queryRecords(table, parameters) {
					expect(parameters.key_condition_expression).to.include('#key = :keyv');
					expect(parameters.expression_attribute_names['#key']).to.equal('key');
					expect(parameters.expression_attribute_values[':keyv']).to.equal('Test Key');
					expect(parameters.limit).to.equal(10);
					return Promise.resolve({ Count: 1, Items: entities });
				}
			});

			let mock_preindexing_helper = class {
				constructor(){

				}
			}

			mockery.registerMock(global.SixCRM.routes.path('helpers', 'indexing/PreIndexing.js'), mock_preindexing_helper);

			mockery.registerMock(global.SixCRM.routes.path('helpers', 'analytics/Activity.js'), class {
				createActivity() {
					return Promise.resolve();
				}
			});

			const TagController = global.SixCRM.routes.include('controllers', 'entities/Tag.js');
			const tagController = new TagController();

			return tagController.listByKey({key:'Test Key', pagination: {limit: 10}}).then(result => {
				expect(result).to.deep.equal({
					tags: entities,
					pagination: {
						count: 1,
						end_cursor: '',
						has_next_page: 'false',
						last_evaluated: ''
					}
				});
			});
		});
	});

	describe('listByKeyFuzzy', () => {
		it('returns list of tags where key begins with search string', () => {
			const entities = [{
				id: '',
				account: '',
				key: 'Test Key',
				value: 'yes'
			}];

			PermissionTestGenerators.givenUserWithAllowed('read', 'tag');

			mockery.registerMock(global.SixCRM.routes.path('controllers', 'providers/dynamodb-provider.js'), class {
				queryRecords(table, parameters) {
					expect(parameters.key_condition_expression).to.include('begins_with(#key, :keyv)');
					expect(parameters.expression_attribute_names['#key']).to.equal('key');
					expect(parameters.expression_attribute_values[':keyv']).to.equal('Test');
					expect(parameters.limit).to.equal(10);
					return Promise.resolve({ Count: 1, Items: entities });
				}
			});

			let mock_preindexing_helper = class {
				constructor(){

				}
			}

			mockery.registerMock(global.SixCRM.routes.path('helpers', 'indexing/PreIndexing.js'), mock_preindexing_helper);

			mockery.registerMock(global.SixCRM.routes.path('helpers', 'analytics/Activity.js'), class {
				createActivity() {
					return Promise.resolve();
				}
			});

			const TagController = global.SixCRM.routes.include('controllers', 'entities/Tag.js');
			const tagController = new TagController();

			return tagController.listByKeyFuzzy({key:'Test', pagination: {limit: 10}}).then(result => {
				expect(result).to.deep.equal({
					tags: entities,
					pagination: {
						count: 1,
						end_cursor: '',
						has_next_page: 'false',
						last_evaluated: ''
					}
				});
			});
		});
	});

	describe('listByEntity', () => {
		it('returns list of tags matching entity', () => {
			const entities = [{
				id: '',
				account: '',
				entity: '',
				key: 'Test Key',
				value: 'yes'
			}];

			PermissionTestGenerators.givenUserWithAllowed('read', 'tag');

			mockery.registerMock(global.SixCRM.routes.path('controllers', 'providers/dynamodb-provider.js'), class {
				queryRecords(table, parameters) {
					expect(parameters.key_condition_expression).to.include('#entity = :index_valuev');
					expect(parameters.expression_attribute_names['#entity']).to.equal('entity');
					expect(parameters.expression_attribute_values[':index_valuev']).to.equal('TestID');
					expect(parameters.limit).to.equal(10);
					return Promise.resolve({ Count: 1, Items: entities });
				}
			});

			let mock_preindexing_helper = class {
				constructor(){

				}
			}

			mockery.registerMock(global.SixCRM.routes.path('helpers', 'indexing/PreIndexing.js'), mock_preindexing_helper);

			mockery.registerMock(global.SixCRM.routes.path('helpers', 'analytics/Activity.js'), class {
				createActivity() {
					return Promise.resolve();
				}
			});

			const TagController = global.SixCRM.routes.include('controllers', 'entities/Tag.js');
			const tagController = new TagController();

			return tagController.listByEntity({id:'TestID', pagination: {limit: 10}}).then(result => {
				expect(result).to.deep.equal({
					tags: entities,
					pagination: {
						count: 1,
						end_cursor: '',
						has_next_page: 'false',
						last_evaluated: ''
					}
				});
			});
		});
	});
});
