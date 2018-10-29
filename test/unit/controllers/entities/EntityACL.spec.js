let chai = require('chai');
let expect = chai.expect;
const mockery = require('mockery');
let PermissionTestGenerators = global.SixCRM.routes.include('test', 'unit/lib/permission-test-generators');

describe('controllers/entities/EntityACL.js', () => {

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

	describe('listByType', () => {
		it('retrieves a list of entityacls by type', () => {
			const acls = [{
				entity: 'af968812-beec-4749-b9e1-c0ae27675c46',
				type: 'emailtemplate',
				allow: ['*'],
				deny: ['*'],
				created_at: '2017-04-06T18:40:41.405Z',
				updated_at: '2017-04-06T18:41:12.521Z'
			}];

			PermissionTestGenerators.givenUserWithAllowed('read', 'entityacl');

			mockery.registerMock(global.SixCRM.routes.path('controllers', 'providers/dynamodb-provider.js'), class {
				queryRecords(table, parameters, index_name) {
					expect(index_name).to.equal('type-index');
					expect(parameters.key_condition_expression).to.include('#type = :index_valuev');
					expect(parameters.expression_attribute_names['#type']).to.equal('type');
					expect(parameters.expression_attribute_values[':index_valuev']).to.equal('emailtemplate');
					expect(parameters.limit).to.equal(10);
					return Promise.resolve({ Count: 1, Items: acls });
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

			const EntityACLController = global.SixCRM.routes.include('controllers', 'entities/EntityACL.js');
			const entityACLController = new EntityACLController();

			return entityACLController.listByType({type: 'emailtemplate', pagination: {limit: 10}}).then(result => {
				expect(result).to.deep.equal({
					entityacls: acls,
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
