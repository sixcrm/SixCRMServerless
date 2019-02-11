const mockery = require('mockery');
let chai = require('chai');
let expect = chai.expect;
const MockEntities = global.SixCRM.routes.include('test', 'mock-entities.js');

function getValidProduct() {
	return MockEntities.getValidProduct()
}

describe('controllers/FulfillmentProvider.js', () => {

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

	after(() => {
		mockery.disable();
	});

	describe('', () => {

		it('creates associated entities object', () => {

			let a_fulfillment_provider_id = 'dummy_id';

			let product = getValidProduct();

			mockery.registerMock('@6crm/sixcrm-product-setup', {
				getProductSetupService() {
					return {
						findProducts({ fulfillment_provider }) {
							expect(fulfillment_provider).to.equal(a_fulfillment_provider_id);
							return Promise.resolve([product]);
						}
					};
				},
				LegacyProduct: class LegacyProduct {
					static fromProduct(product) {
						return product;
					}
				}
			});

			let FulfillmentProviderController = global.SixCRM.routes.include('controllers','entities/FulfillmentProvider.js');
			const fulfillmentProviderController = new FulfillmentProviderController();

			return fulfillmentProviderController.associatedEntitiesCheck({id : a_fulfillment_provider_id}).then((result) => {
				expect(result).to.deep.equal([{
					entity: {
						id: product.id
					},
					name: "Product"
				}]);
			});
		});

		it('throws error when object is missing an id', () => {

			let a_fulfillment_provider_id = 'dummy_id';

			let product = getValidProduct();

			delete product.id;

			mockery.registerMock('@6crm/sixcrm-product-setup', {
				getProductSetupService() {
					return {
						findProducts({ fulfillment_provider }) {
							expect(fulfillment_provider).to.equal(a_fulfillment_provider_id);
							return Promise.resolve([product]);
						}
					};
				},
				LegacyProduct: class LegacyProduct {
					static fromProduct(product) {
						return product;
					}
				}
			});

			let FulfillmentProviderController = global.SixCRM.routes.include('controllers','entities/FulfillmentProvider.js');
			const fulfillmentProviderController = new FulfillmentProviderController();

			return fulfillmentProviderController.associatedEntitiesCheck({id : a_fulfillment_provider_id}).catch((error) => {
				expect(error.message).to.equal('[500] Create Associated Entities expects the object parameter to have field "id"');
			});
		});
	});
});
