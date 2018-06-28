
const _ = require('lodash');
const chai = require("chai");
const uuidV4 = require('uuid/v4');
const expect = chai.expect;
const mockery = require('mockery');
const objectutilities = require('@6crm/sixcrmcore/util/object-utilities').default;
const arrayutilities = require('@6crm/sixcrmcore/util/array-utilities').default;
const MockEntities = global.SixCRM.routes.include('test', 'mock-entities.js');

function getValidShippingReceipt(){
	return MockEntities.getValidShippingReceipt();
}

function getValidRebill(){
	return MockEntities.getValidRebill();
}

function getValidSession(){
	return MockEntities.getValidSession();
}

function getValidCustomer(){
	return MockEntities.getValidCustomer();
}

function getValidTransactionProducts(){
	return MockEntities.getValidTransactionProducts(null, true);
}

function getValidTransaction(){
	return MockEntities.getValidTransaction();
}

function getValidAugmentedTransactionProducts(){

	let transaction_products = getValidTransactionProducts();

	return arrayutilities.map(transaction_products, transaction_product => {
		return objectutilities.merge(transaction_product, {transaction: getValidTransaction()});
	});

}

function getValidProducts(product_ids){

	if(_.isUndefined(product_ids)){
		product_ids = [uuidV4(), uuidV4()];
	}

	return arrayutilities.map(product_ids, product_id => {
		return MockEntities.getValidProduct(product_id);
	});

}

function getValidFulfillmentProvider(){
	return MockEntities.getValidFulfillmentProvider();
}

function getValidVendorResponse(){

	const VendorResponse = global.SixCRM.routes.include('vendors', 'fulfillmentproviders/Hashtag/Response.js');

	return new VendorResponse({
		vendor_response: {
			error: null,
			body: 'Everybody needs somebody.',
			response: {
				body:'<?xml version="1.0" encoding="utf-8"?><soap:Envelope xmlns:soap="http://schemas.xmlsoap.org/soap/envelope/" xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance" xmlns:xsd="http://www.w3.org/2001/XMLSchema"><soap:Body><Int32 xmlns="http://www.JOI.com/schemas/ViaSub.WMS/">1</Int32><warnings xmlns="http://www.JOI.com/schemas/ViaSub.WMS/" /></soap:Body></soap:Envelope>',
				statusCode:200,
				statusMessage:'OK'
			}
		},
		action: 'fulfill',
		additional_parameters: {
			reference_number: uuidV4()
		}
	});
}

describe('helpers/shipment/ShipmentUtilities.js', () => {

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

		mockery.registerMock(global.SixCRM.routes.path('controllers', 'providers/sns-provider.js'), class {
			publish() {
				return Promise.resolve({});
			}
			getRegion() {
				return 'localhost';
			}
		});
	});

	afterEach(() => {
		mockery.resetCache();
		mockery.deregisterAll();
	});

	describe('hydrateFulfillmentProviders', () => {

		it('successfully hydrates fulfillment providers', () => {

			let fulfillment_provider = getValidFulfillmentProvider();

			mockery.registerMock(global.SixCRM.routes.path('entities', 'FulfillmentProvider.js'), class {
				get() {
					return Promise.resolve(fulfillment_provider);
				}
				sanitize(argument){
					expect(argument).to.be.a('boolean');
				}
			});

			const ShipmentUtilitiesController = global.SixCRM.routes.include('helpers', 'shipment/ShipmentUtilities.js');
			let shipmentUtilitiesController = new ShipmentUtilitiesController();

			shipmentUtilitiesController.parameters.set('fulfillmentproviderid', fulfillment_provider.id);

			return shipmentUtilitiesController.hydrateFulfillmentProvider().then(result => {
				expect(result).to.equal(true);
				expect(shipmentUtilitiesController.parameters.store['fulfillmentprovider'], fulfillment_provider);
			});

		});

	});

	describe('hydrateProducts', () => {

		it('successfully hydrates products', () => {

			let augmented_transaction_products = getValidAugmentedTransactionProducts();
			let products = getValidProducts();

			mockery.registerMock(global.SixCRM.routes.path('entities', 'Product.js'), class {
				getListByAccount() {
					return Promise.resolve({products: products});
				}
				getResult(result, field) {
					if(_.isUndefined(field)){
						field = this.descriptive_name+'s';
					}

					if(_.has(result, field)){
						return Promise.resolve(result[field]);
					}else{
						return Promise.resolve(null);
					}
				}
			});

			const ShipmentUtilitiesController = global.SixCRM.routes.include('helpers', 'shipment/ShipmentUtilities.js');
			let shipmentUtilitiesController = new ShipmentUtilitiesController();

			shipmentUtilitiesController.parameters.set('augmentedtransactionproducts', augmented_transaction_products);

			return shipmentUtilitiesController.hydrateProducts().then(result => {
				expect(result).to.equal(true);
				expect(shipmentUtilitiesController.parameters.store['products'], products);
			});

		});

	});

	describe('acquireCustomerFromSession', () => {

		it('successfully acquires a customer from a session', () => {

			let session = getValidSession();
			let customer = getValidCustomer();

			mockery.registerMock(global.SixCRM.routes.path('entities', 'Session.js'), class {
				getCustomer() {
					return Promise.resolve(customer);
				}
			});

			const ShipmentUtilitiesController = global.SixCRM.routes.include('helpers', 'shipment/ShipmentUtilities.js');
			let shipmentUtilitiesController = new ShipmentUtilitiesController();

			shipmentUtilitiesController.parameters.set('session', session);

			return shipmentUtilitiesController.acquireCustomerFromSession().then(result => {
				expect(result).to.equal(true);
				expect(shipmentUtilitiesController.parameters.store['customer']).to.equal(customer);
			});

		});

	});

	describe('acquireRebillFromTransactions', () => {

		it('successfully acquires a rebill from transactions', () => {

			let rebill = getValidRebill();
			let augmented_transaction_products = getValidAugmentedTransactionProducts();

			arrayutilities.map(augmented_transaction_products, (atp, index) => {
				augmented_transaction_products[index].transaction.rebill = rebill.id
			});

			mockery.registerMock(global.SixCRM.routes.path('entities', 'Rebill.js'), class {
				get() {
					return Promise.resolve(rebill);
				}
			});

			const ShipmentUtilitiesController = global.SixCRM.routes.include('helpers', 'shipment/ShipmentUtilities.js');
			let shipmentUtilitiesController = new ShipmentUtilitiesController();

			shipmentUtilitiesController.parameters.set('augmentedtransactionproducts', augmented_transaction_products);

			return shipmentUtilitiesController.acquireRebillFromTransactions().then(result => {
				expect(result).to.equal(true);
				expect(shipmentUtilitiesController.parameters.store['rebill']).to.deep.equal(rebill);
			});

		});

		it('throws error when rebill ID is non-distinct', () => {

			let augmented_transaction_products = getValidAugmentedTransactionProducts();

			const ShipmentUtilitiesController = global.SixCRM.routes.include('helpers', 'shipment/ShipmentUtilities.js');
			let shipmentUtilitiesController = new ShipmentUtilitiesController();

			shipmentUtilitiesController.parameters.set('augmentedtransactionproducts', augmented_transaction_products);

			try {
				shipmentUtilitiesController.acquireRebillFromTransactions()
			} catch (error) {
				expect(error.message).to.equal('[500] Non-distinct rebill ID.');
			}

		});

	});

	describe('acquireRebill', () => {

		it('successfully acquires a rebill', () => {

			let rebill = getValidRebill();

			mockery.registerMock(global.SixCRM.routes.path('entities', 'Rebill.js'), class {
				get() {
					return Promise.resolve(rebill);
				}
			});

			const ShipmentUtilitiesController = global.SixCRM.routes.include('helpers', 'shipment/ShipmentUtilities.js');
			let shipmentUtilitiesController = new ShipmentUtilitiesController();

			shipmentUtilitiesController.parameters.set('rebillid', rebill.id);

			return shipmentUtilitiesController.acquireRebill().then(result => {
				expect(result).to.equal(true);
				expect(shipmentUtilitiesController.parameters.store['rebill']).to.equal(rebill);
			});

		});

	});

	describe('acquireSessionFromRebill', () => {

		it('successfully acquires a session from a rebill', () => {

			let rebill = getValidRebill();
			let session = getValidSession();

			mockery.registerMock(global.SixCRM.routes.path('entities', 'Session.js'), class {
				get() {
					return Promise.resolve(session);
				}
			});

			const ShipmentUtilitiesController = global.SixCRM.routes.include('helpers', 'shipment/ShipmentUtilities.js');
			let shipmentUtilitiesController = new ShipmentUtilitiesController();

			shipmentUtilitiesController.parameters.set('rebill', rebill);

			return shipmentUtilitiesController.acquireSessionFromRebill().then(result => {
				expect(result).to.equal(true);
				expect(shipmentUtilitiesController.parameters.store['session']).to.equal(session);
			});

		});

	});

	describe('acquireCustomerFromSession', () => {

		it('successfully acquires a customer from a session', () => {

			let session = getValidSession();
			let customer = getValidCustomer();

			mockery.registerMock(global.SixCRM.routes.path('entities', 'Session.js'), class {
				getCustomer() {
					return Promise.resolve(customer);
				}
			});

			const ShipmentUtilitiesController = global.SixCRM.routes.include('helpers', 'shipment/ShipmentUtilities.js');
			let shipmentUtilitiesController = new ShipmentUtilitiesController();

			shipmentUtilitiesController.parameters.set('session', session);

			return shipmentUtilitiesController.acquireCustomerFromSession().then(result => {
				expect(result).to.equal(true);
				expect(shipmentUtilitiesController.parameters.store['customer']).to.equal(customer);
			});

		});

	});

	describe('acquireCustomer', () => {

		it('successfully acquires a customer', () => {

			let rebill = getValidRebill();
			let session = getValidSession();
			let customer = getValidCustomer();
			let augmented_transaction_products = getValidAugmentedTransactionProducts();

			arrayutilities.map(augmented_transaction_products, (atp, index) => {
				augmented_transaction_products[index].transaction.rebill = rebill.id
			});

			mockery.registerMock(global.SixCRM.routes.path('entities', 'Session.js'), class {
				getCustomer() {
					return Promise.resolve(customer);
				}
				get() {
					return Promise.resolve(session);
				}
			});

			mockery.registerMock(global.SixCRM.routes.path('entities', 'Rebill.js'), class {
				get() {
					return Promise.resolve(rebill);
				}
			});

			const ShipmentUtilitiesController = global.SixCRM.routes.include('helpers', 'shipment/ShipmentUtilities.js');
			let shipmentUtilitiesController = new ShipmentUtilitiesController();

			shipmentUtilitiesController.parameters.set('augmentedtransactionproducts', augmented_transaction_products);

			return shipmentUtilitiesController.acquireCustomer().then(result => {
				expect(result).to.equal(true);
				expect(shipmentUtilitiesController.parameters.store['customer']).to.equal(customer);
			});

		});

	});

	describe('markTransactionProductsWithShippingReceipt', () => {

		it('successfully marks transaction products with a shipping receipt', () => {

			let shipping_receipt = getValidShippingReceipt();
			let augmented_transaction_products = getValidAugmentedTransactionProducts();

			let mock_transaction_helper_controller = class {
				constructor(){

				}
				updateTransactionProduct({transaction_product}){
					let transaction = getValidTransaction();

					transaction.products = [transaction_product]
					return Promise.resolve(transaction);
				}
			}

			mockery.registerMock(global.SixCRM.routes.path('helpers', 'entities/transaction/Transaction.js'), mock_transaction_helper_controller);

			const ShipmentUtilitiesController = global.SixCRM.routes.include('helpers', 'shipment/ShipmentUtilities.js');
			let shipmentUtilitiesController = new ShipmentUtilitiesController();

			shipmentUtilitiesController.parameters.set('shippingreceipt', shipping_receipt);
			shipmentUtilitiesController.parameters.set('augmentedtransactionproducts', augmented_transaction_products);

			return shipmentUtilitiesController.markTransactionProductsWithShippingReceipt().then(result => {
				expect(result).to.equal(true);
			});

		});

	});

	describe('instantiateFulfillmentProviderClass', () => {
		it('successfully instantiates a fulfillment provider class', () => {

			let fulfillment_provider = getValidFulfillmentProvider();

			let mock_fulfillment_provider_class = class {
				constructor(){

				}
			}

			mockery.registerMock(global.SixCRM.routes.path('vendors','fulfillmentproviders/Hashtag/handler.js'), mock_fulfillment_provider_class);

			let mock_fulfillment_provider = new mock_fulfillment_provider_class({});

			const ShipmentUtilitiesController = global.SixCRM.routes.include('helpers', 'shipment/ShipmentUtilities.js');
			let shipmentUtilitiesController = new ShipmentUtilitiesController();

			shipmentUtilitiesController.parameters.set('fulfillmentprovider', fulfillment_provider);

			let result = shipmentUtilitiesController.instantiateFulfillmentProviderClass();

			expect(result).to.equal(true);
			expect(shipmentUtilitiesController.parameters.store['instantiatedfulfillmentprovider']).to.deep.equal(mock_fulfillment_provider);

		});

	});

	describe('issueReceipts', () => {

		it('successfully issues a shipping receipt', () => {

			let shipping_receipt = getValidShippingReceipt();

			let mock_terminal_receipt_controller = class {
				constructor(){

				}
				issueReceipt(){
					return Promise.resolve(shipping_receipt);
				}
			};

			mockery.registerMock(global.SixCRM.routes.path('providers', 'terminal/Receipt.js'), mock_terminal_receipt_controller);

			const ShipmentUtilitiesController = global.SixCRM.routes.include('helpers', 'shipment/ShipmentUtilities.js');
			let shipmentUtilitiesController = new ShipmentUtilitiesController();

			return shipmentUtilitiesController.issueReceipts().then(result => {
				expect(result).to.equal(true);
				expect(shipmentUtilitiesController.parameters.store['shippingreceipt']).to.deep.equal(shipping_receipt);
			})

		});

	});

	describe('pruneResponse', () => {

		it('prunes response', () => {

			let vendor_response_class = getValidVendorResponse();

			const ShipmentUtilitiesController = global.SixCRM.routes.include('helpers', 'shipment/ShipmentUtilities.js');
			let shipmentUtilitiesController = new ShipmentUtilitiesController();

			shipmentUtilitiesController.parameters.set('vendorresponseclass', vendor_response_class);

			expect(shipmentUtilitiesController.pruneResponse()).to.equal(true);

			let vendor_response = shipmentUtilitiesController.parameters.get('vendorresponseclass');

			expect(vendor_response.parameters.store['vendorresponse']).to.be.undefined;
			expect(vendor_response.parameters.store['response']).to.be.undefined;

		});

	});

	describe('validateResponse', () => {

		it('validates response', () => {

			let vendor_response_class = getValidVendorResponse();

			const ShipmentUtilitiesController = global.SixCRM.routes.include('helpers', 'shipment/ShipmentUtilities.js');
			let shipmentUtilitiesController = new ShipmentUtilitiesController();

			shipmentUtilitiesController.parameters.set('vendorresponseclass', vendor_response_class);

			//any valid vendor response validation
			shipmentUtilitiesController.response_validation = global.SixCRM.routes.path('model', 'providers/shipping/terminal/responses/fulfill.json');

			expect(shipmentUtilitiesController.validateResponse()).to.equal(true);

		});

		it('returns false when response validation is not set', () => {

			const ShipmentUtilitiesController = global.SixCRM.routes.include('helpers', 'shipment/ShipmentUtilities.js');
			let shipmentUtilitiesController = new ShipmentUtilitiesController();

			delete shipmentUtilitiesController.response_validation;

			expect(shipmentUtilitiesController.validateResponse()).to.equal(false);

		});

	});

	describe('hydrateShippingReceiptProperties', () => {

		it('hydrates shipping receipt properties', () => {

			let shipping_receipt = getValidShippingReceipt();

			let fulfillment_provider = getValidFulfillmentProvider();

			mockery.registerMock(global.SixCRM.routes.path('entities', 'FulfillmentProvider.js'), class {
				get() {
					return Promise.resolve(fulfillment_provider);
				}
				sanitize(argument){
					expect(argument).to.be.a('boolean');
				}
			});

			const ShipmentUtilitiesController = global.SixCRM.routes.include('helpers', 'shipment/ShipmentUtilities.js');
			let shipmentUtilitiesController = new ShipmentUtilitiesController();

			shipmentUtilitiesController.parameters.set('shippingreceipt', shipping_receipt);

			return shipmentUtilitiesController.hydrateShippingReceiptProperties().then((result) => {
				expect(result).to.equal(true);
				expect(shipmentUtilitiesController.parameters.store['fulfillmentprovider']).to.deep.equal(fulfillment_provider);
			});
		});

	});

});
