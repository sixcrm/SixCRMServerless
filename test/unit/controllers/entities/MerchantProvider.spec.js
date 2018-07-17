const mockery = require('mockery');
let chai = require('chai');
let expect = chai.expect;
const MockEntities = global.SixCRM.routes.include('test', 'mock-entities.js');

function getValidMerchantProviderGroup() {
	return MockEntities.getValidMerchantProviderGroup()
}

function getTransaction() {
	return MockEntities.getValidTransaction()
}

describe('controllers/MerchantProvider.js', () => {

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

	describe('associatedEntitiesCheck', () => {

		it('creates associated entities object', () => {

			let a_merchant_provider_id = 'dummy_id';

			let merchantprovidergroup = getValidMerchantProviderGroup();
			let transaction = getTransaction();

			mockery.registerMock(global.SixCRM.routes.path('controllers', 'entities/Transaction.js'), class {
				listByMerchantProviderID({id}) {
					expect(id).to.equal(a_merchant_provider_id);
					return Promise.resolve({transactions: [transaction]});
				}
			});

			mockery.registerMock(global.SixCRM.routes.path('controllers', 'entities/MerchantProviderGroup.js'), class {
				listByMerchantProviderID({id}) {
					expect(id).to.equal(a_merchant_provider_id);
					return Promise.resolve([merchantprovidergroup]);
				}
			});

			let MerchantProviderController = global.SixCRM.routes.include('controllers','entities/MerchantProvider.js');
			const merchantProviderController = new MerchantProviderController();

			return merchantProviderController.associatedEntitiesCheck({id : a_merchant_provider_id}).then((result) => {
				expect(result).to.deep.equal([{
					entity: {
						id: merchantprovidergroup.id
					},
					name: "Merchant Provider Group"
				}, {
					entity: {
						id: transaction.id
					},
					name: "Transaction"
				}]);
			});
		});

		it('throws error when object is missing an id', () => {

			let a_merchant_provider_id = 'dummy_id';

			let merchantprovidergroup = getValidMerchantProviderGroup();
			let transaction = getTransaction();
			delete transaction.id;
			delete merchantprovidergroup.id;

			mockery.registerMock(global.SixCRM.routes.path('controllers', 'entities/Transaction.js'), class {
				listByMerchantProviderID({id}) {
					expect(id).to.equal(a_merchant_provider_id);
					return Promise.resolve({transactions: [transaction]});
				}
			});

			mockery.registerMock(global.SixCRM.routes.path('controllers', 'entities/MerchantProviderGroup.js'), class {
				listByMerchantProviderID({id}) {
					expect(id).to.equal(a_merchant_provider_id);
					return Promise.resolve([merchantprovidergroup]);
				}
			});

			let MerchantProviderController = global.SixCRM.routes.include('controllers','entities/MerchantProvider.js');
			const merchantProviderController = new MerchantProviderController();

			return merchantProviderController.associatedEntitiesCheck({id : a_merchant_provider_id}).catch((error) => {
				expect(error.message).to.equal('[500] Create Associated Entities expects the object parameter to have field "id"');
			});
		});
	});
});
