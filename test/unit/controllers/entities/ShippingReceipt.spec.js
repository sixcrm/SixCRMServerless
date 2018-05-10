let chai = require('chai');
let expect = chai.expect;
const mockery = require('mockery');

describe('controllers/ShippingReceipt.js', () => {

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

	describe('getFulfillmentProvider', () => {

		it('returns a fulfillment provider', () => {
			let shipping_receipt = {
				fulfillment_provider: 'dummy_id'
			};

			mockery.registerMock(global.SixCRM.routes.path('controllers','entities/FulfillmentProvider.js'), class {
				get({id}) {
					expect(id).to.equal(shipping_receipt.fulfillment_provider);
					return Promise.resolve('a_fulfillment_provider')
				}
			});

			let ShippingReceiptController = global.SixCRM.routes.include('controllers','entities/ShippingReceipt.js');
			const shippingReceiptController = new ShippingReceiptController();

			return shippingReceiptController.getFulfillmentProvider(shipping_receipt).then((result) => {
				expect(result).to.equal('a_fulfillment_provider');
			});
		});

		it('returns null when shipping receipt does not have a fulfillment provider', () => {
			let shipping_receipt = {};

			let ShippingReceiptController = global.SixCRM.routes.include('controllers','entities/ShippingReceipt.js');
			const shippingReceiptController = new ShippingReceiptController();

			return shippingReceiptController.getFulfillmentProvider(shipping_receipt).then((result) => {
				expect(result).to.equal(null);
			});
		});
	});
});
