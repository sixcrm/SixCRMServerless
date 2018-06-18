let chai = require('chai');
let expect = chai.expect;
const mockery = require('mockery');
const MockEntities = global.SixCRM.routes.include('test', 'mock-entities.js');
let PermissionTestGenerators = global.SixCRM.routes.include('test', 'unit/lib/permission-test-generators');

function getValidAccessKey() {
	return MockEntities.getValidAccessKey();
}

describe('controllers/AccessKey.js', () => {

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

	describe('update', () => {

		it('successfully updates access key', () => {

			let access_key = getValidAccessKey();

			let params = {
				entity: {
					id: 'aaaaaaaa-aaaa-4aaa-aaaa-aaaaaaaaaaaa', //valid id format
					updated_at: access_key.updated_at
				}
			};

			PermissionTestGenerators.givenUserWithAllowed('*', 'accesskey');

			mockery.registerMock(global.SixCRM.routes.path('controllers', 'providers/dynamodb-provider.js'), class {
				queryRecords(table, parameters) {
					expect(table).to.equal('accesskeys');
					expect(parameters.expression_attribute_values[':primary_keyv']).to.equal(params.entity.id);
					return Promise.resolve({
						Count: 1,
						Items: [access_key]
					});
				}
				saveRecord(tableName, entity) {
					expect(tableName).to.equal('accesskeys');
					expect(entity.access_key).to.equal(access_key.access_key);
					expect(entity.secret_key).to.equal(access_key.secret_key);
					return Promise.resolve(entity);
				}
			});

			mockery.registerMock(global.SixCRM.routes.path('helpers', 'indexing/PreIndexing.js'), class {
				constructor(){}
			});

			mockery.registerMock(global.SixCRM.routes.path('helpers', 'analytics/Activity.js'), class {
				createActivity() {
					return Promise.resolve();
				}
			});

			const AccessKeyController = global.SixCRM.routes.include('controllers', 'entities/AccessKey.js');
			const accessKeyController = new AccessKeyController();

			return accessKeyController.update(params).then((result) => {
				expect(result.access_key).to.equal(access_key.access_key);
				expect(result.secret_key).to.equal(access_key.secret_key);
			});
		});
	});

	describe('getAccessKeyByKey', () => {

		it('successfully gets access key by key', () => {

			let access_key = getValidAccessKey();

			let mock_entity = class {
				constructor(){}

				getBySecondaryIndex({field, index_value, index_name}) {
					expect(field).to.equal('access_key');
					expect(index_value).to.equal('an_access_key');
					expect(index_name).to.equal('access_key-index');
					return Promise.resolve(access_key);
				}
			};

			mockery.registerMock(global.SixCRM.routes.path('controllers','entities/Entity.js'), mock_entity);

			const AccessKeyController = global.SixCRM.routes.include('controllers', 'entities/AccessKey.js');
			const accessKeyController = new AccessKeyController();

			accessKeyController.disableACLs = () => {};
			accessKeyController.enableACLs = () => {};

			return accessKeyController.getAccessKeyByKey('an_access_key').then((result) => {
				expect(result).to.deep.equal(access_key);
			});
		});
	});
});
