let chai = require('chai');
let expect = chai.expect;
const mockery = require('mockery');
let PermissionTestGenerators = global.SixCRM.routes.include('test', 'unit/lib/permission-test-generators');
const MockEntities = global.SixCRM.routes.include('test', 'mock-entities.js');
const arrayutilities = require('@6crm/sixcrmcore/util/array-utilities').default;

function getValidMerchantProviderGroup() {
	return MockEntities.getValidMerchantProviderGroup();
}

describe('controllers/MerchantProviderGroup.js', () => {

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

	describe('listByMerchantProviderID', () => {

		it('lists merchant provider group by merchant provider', () => {

			let merchant_provider_group = getValidMerchantProviderGroup();

			let merchant_provider = {id: merchant_provider_group.merchantproviders[0].id};

			PermissionTestGenerators.givenUserWithAllowed('read', 'merchantprovidergroup');

			mockery.registerMock(global.SixCRM.routes.path('controllers', 'providers/dynamodb-provider.js'), class {
				queryRecords(table, parameters, index) {
					expect(index).to.equal('account-index');
					expect(table).to.equal('merchantprovidergroups');
					expect(parameters).to.have.property('expression_attribute_names');
					expect(parameters).to.have.property('key_condition_expression');
					expect(parameters).to.have.property('expression_attribute_values');
					return Promise.resolve({
						Count: 1,
						Items: [merchant_provider_group]
					});
				}
			});

			let MerchantProviderGroupController = global.SixCRM.routes.include('controllers','entities/MerchantProviderGroup.js');
			const merchantProviderGroupController = new MerchantProviderGroupController();

			return merchantProviderGroupController.listByMerchantProviderID(merchant_provider).then((result) => {
				expect(result).to.deep.equal([merchant_provider_group]);
			});
		});

		it('returns an empty array when there are no merchantprovidergroups with corresponding merchant provider id', () => {

			let merchant_provider_group = getValidMerchantProviderGroup();

			let merchant_provider = {id: merchant_provider_group.merchantproviders[0].id};

			PermissionTestGenerators.givenUserWithAllowed('read', 'merchantprovidergroup');

			mockery.registerMock(global.SixCRM.routes.path('controllers', 'providers/dynamodb-provider.js'), class {
				queryRecords(table, parameters, index) {
					expect(index).to.equal('account-index');
					expect(table).to.equal('merchantprovidergroups');
					expect(parameters).to.have.property('expression_attribute_names');
					expect(parameters).to.have.property('key_condition_expression');
					expect(parameters).to.have.property('expression_attribute_values');
					return Promise.resolve({
						Count: 1,
						Items: []
					});
				}
			});

			let MerchantProviderGroupController = global.SixCRM.routes.include('controllers','entities/MerchantProviderGroup.js');
			const merchantProviderGroupController = new MerchantProviderGroupController();

			return merchantProviderGroupController.listByMerchantProviderID(merchant_provider).then((result) => {
				expect(result).to.deep.equal([]);
			});
		});

		it('returns an empty array when there aren\'t any merchant providers', () => {

			let merchant_provider_group = getValidMerchantProviderGroup();

			let merchant_provider = {id: merchant_provider_group.merchantproviders[0].id};

			delete merchant_provider_group.merchantproviders;

			PermissionTestGenerators.givenUserWithAllowed('read', 'merchantprovidergroup');

			mockery.registerMock(global.SixCRM.routes.path('controllers', 'providers/dynamodb-provider.js'), class {
				queryRecords(table, parameters, index) {
					expect(index).to.equal('account-index');
					expect(table).to.equal('merchantprovidergroups');
					expect(parameters).to.have.property('expression_attribute_names');
					expect(parameters).to.have.property('key_condition_expression');
					expect(parameters).to.have.property('expression_attribute_values');
					return Promise.resolve({
						Count: 1,
						Items: [merchant_provider_group]
					});
				}
			});

			let MerchantProviderGroupController = global.SixCRM.routes.include('controllers','entities/MerchantProviderGroup.js');
			const merchantProviderGroupController = new MerchantProviderGroupController();

			return merchantProviderGroupController.listByMerchantProviderID(merchant_provider).then((result) => {
				expect(result).to.deep.equal([]);
			});
		});

		it('returns an empty array when merchant providers don\'t have any data', () => {

			let merchant_provider_group = getValidMerchantProviderGroup();

			let merchant_provider = {id: merchant_provider_group.merchantproviders[0].id};

			merchant_provider_group.merchantproviders = [];

			PermissionTestGenerators.givenUserWithAllowed('read', 'merchantprovidergroup');

			mockery.registerMock(global.SixCRM.routes.path('controllers', 'providers/dynamodb-provider.js'), class {
				queryRecords(table, parameters, index) {
					expect(index).to.equal('account-index');
					expect(table).to.equal('merchantprovidergroups');
					expect(parameters).to.have.property('expression_attribute_names');
					expect(parameters).to.have.property('key_condition_expression');
					expect(parameters).to.have.property('expression_attribute_values');
					return Promise.resolve({
						Count: 1,
						Items: [merchant_provider_group]
					});
				}
			});

			let MerchantProviderGroupController = global.SixCRM.routes.include('controllers','entities/MerchantProviderGroup.js');
			const merchantProviderGroupController = new MerchantProviderGroupController();

			return merchantProviderGroupController.listByMerchantProviderID(merchant_provider).then((result) => {
				expect(result).to.deep.equal([]);
			});
		});

		it('returns an empty array when merchant provider with specified id does not exist', () => {

			let merchant_provider_group = getValidMerchantProviderGroup();

			let merchant_provider = {id: 'dummy_id'};

			PermissionTestGenerators.givenUserWithAllowed('read', 'merchantprovidergroup');

			mockery.registerMock(global.SixCRM.routes.path('controllers', 'providers/dynamodb-provider.js'), class {
				queryRecords(table, parameters, index) {
					expect(index).to.equal('account-index');
					expect(table).to.equal('merchantprovidergroups');
					expect(parameters).to.have.property('expression_attribute_names');
					expect(parameters).to.have.property('key_condition_expression');
					expect(parameters).to.have.property('expression_attribute_values');
					return Promise.resolve({
						Count: 1,
						Items: [merchant_provider_group]
					});
				}
			});

			let MerchantProviderGroupController = global.SixCRM.routes.include('controllers','entities/MerchantProviderGroup.js');
			const merchantProviderGroupController = new MerchantProviderGroupController();

			return merchantProviderGroupController.listByMerchantProviderID(merchant_provider).then((result) => {
				expect(result).to.deep.equal([]);
			});
		});
	});

	describe('getMerchantProviderConfigurations', () => {

		it('successfully retrieves merchant provider configurations', () => {

			let merchantprovidergroup = getValidMerchantProviderGroup();

			let MerchantProviderGroupController = global.SixCRM.routes.include('controllers', 'entities/MerchantProviderGroup.js');
			const merchantProviderGroupController = new MerchantProviderGroupController();

			let merchant_provider_configurations = merchantProviderGroupController.getMerchantProviderConfigurations(merchantprovidergroup);

			expect(merchant_provider_configurations).to.deep.equal(arrayutilities.map(merchantprovidergroup.merchantproviders, merchant_provider_configuration => {
				return {
					merchantprovider: merchant_provider_configuration.id,
					distribution: merchant_provider_configuration.distribution
				}
			}));

		});

	});

	describe('getMerchantProviderConfiguration', () => {

		it('retrieves merchant provider configuration', () => {
			let merchant_provider_configuration = {
				merchantprovider: 'dummy_id'
			};

			mockery.registerMock(global.SixCRM.routes.path('controllers','entities/MerchantProvider.js'), class {
				get({id}) {
					expect(id).to.equal(merchant_provider_configuration.merchantprovider);
					return Promise.resolve('a_merchant_provider');
				}
			});

			let MerchantProviderGroupController = global.SixCRM.routes.include('controllers', 'entities/MerchantProviderGroup.js');
			const merchantProviderGroupController = new MerchantProviderGroupController();

			return merchantProviderGroupController.getMerchantProviderConfiguration(merchant_provider_configuration).then((result) => {
				expect(result).to.deep.equal('a_merchant_provider');
			});
		})
	});
});
