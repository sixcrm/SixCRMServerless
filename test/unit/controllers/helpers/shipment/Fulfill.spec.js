
const _ = require('lodash');
const chai = require("chai");
const uuidV4 = require('uuid/v4');
const expect = chai.expect;
const mockery = require('mockery');
const randomutilities = require('@6crm/sixcrmcore/util/random').default;
const objectutilities = require('@6crm/sixcrmcore/util/object-utilities').default;
const arrayutilities = require('@6crm/sixcrmcore/util/array-utilities').default;
const MockEntities = global.SixCRM.routes.include('test', 'mock-entities.js');

function getValidTransactionProducts(ids, extended){

	return [
		MockEntities.getValidTransactionProduct(ids, extended),
		MockEntities.getValidTransactionProduct(ids, extended)
	];

}

function getValidAugmentedTransactionProducts(ids, extended){

	let transaction_products = getValidTransactionProducts(ids, extended);

	return arrayutilities.map(transaction_products, transaction_product => {
		return objectutilities.merge(transaction_product, {transaction: getValidTransaction()});
	});

}

function getValidHydratedAugmentedTransactionProducts(){

	return [
		getValidHydratedAugmentedTransactionProduct(),
		getValidHydratedAugmentedTransactionProduct()
	];

}

function getValidHydratedAugmentedTransactionProduct(){

	return {
		product: getValidProduct(),
		transaction: getValidTransaction(),
		amount: getValidAmount()
	};

}

function getValidAmount(){

	return (randomutilities.randomInt(1000, 10000) * .01);

}

function getValidProduct(){

	return MockEntities.getValidProduct()

}

function getValidTransaction(){
	return MockEntities.getValidTransaction()
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

function getValidCustomer(){
	return MockEntities.getValidCustomer()
}

function getValidRebill(){
	return MockEntities.getValidRebill();
}

function getValidSession(){
	return MockEntities.getValidSession();
}

function getValidInstantiatedFulfillmentProvider(){

	let processor_response = getValidVendorResponse();
	let fulfillment_provider = class {
		constructor(){}
		fulfill(){
			return Promise.resolve(processor_response);
		}
	}

	return new fulfillment_provider({});

}

function getValidFulfillmentProvider(){

	return MockEntities.getValidFulfillmentProvider()

}

describe('helpers/shipment/Fulfill.js', () => {

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

	describe('constructor', () => {

		it('successfully constructs', () => {

			let FulfillController = global.SixCRM.routes.include('helpers', 'shipment/Fulfill.js');
			let fulfillController = new FulfillController();

			expect(objectutilities.getClassName(fulfillController)).to.equal('FulfillController');

		});

	});

	describe('executeFulfillment', () => {
		it('successfully executes fulfillment', () => {

			let instantiated_fulfillment_provider = getValidInstantiatedFulfillmentProvider();
			let hydrated_augmented_transaction_products = getValidHydratedAugmentedTransactionProducts();
			let customer = getValidCustomer();

			let FulfillController = global.SixCRM.routes.include('helpers', 'shipment/Fulfill.js');
			let fulfillController = new FulfillController();

			fulfillController.parameters.set('instantiatedfulfillmentprovider', instantiated_fulfillment_provider);
			fulfillController.parameters.set('hydratedaugmentedtransactionproducts', hydrated_augmented_transaction_products);
			fulfillController.parameters.set('customer', customer);

			return fulfillController.executeFulfillment().then(result => {
				expect(result).to.equal(true);
				expect(fulfillController.parameters.store['providerresponse']).to.be.defined;
			});

		});
	});

	describe('hydrateAugmentedTransactionProducts', () => {
		it('successfully hydrates augmented transaction products', () => {

			let mock_shipment_utilities = class {
				constructor(){

				}
				augmentParameters(){
					return true;
				}
				hydrateProducts(){
					return Promise.resolve(true);
				}
				marryProductsToAugmentedTransactionProducts(){
					return Promise.resolve(true);
				}

			};

			mockery.registerMock(global.SixCRM.routes.path('helpers', 'shipment/ShipmentUtilities.js'), mock_shipment_utilities);

			let FulfillController = global.SixCRM.routes.include('helpers', 'shipment/Fulfill.js');
			let fulfillController = new FulfillController();

			return fulfillController.hydrateAugmentedTransactionProducts().then(result => {
				expect(result).to.equal(true);
			});

		});
	});

	describe('hydrateRequestProperties', () => {

		it('successfully hydrates request properties', () => {

			let mock_shipment_utilities = class {
				constructor(){

				}
				augmentParameters(){
					return true;
				}
				hydrateProducts(){
					return Promise.resolve(true);
				}
				marryProductsToAugmentedTransactionProducts(){
					return Promise.resolve(true);
				}
				hydrateFulfillmentProvider(){
					return Promise.resolve(true);
				}
				acquireCustomer(){
					return Promise.resolve(true);
				}

			}

			mockery.registerMock(global.SixCRM.routes.path('helpers', 'shipment/ShipmentUtilities.js'), mock_shipment_utilities);

			const FulfillController = global.SixCRM.routes.include('helpers', 'shipment/Fulfill.js');
			let fulfillController = new FulfillController();

			return fulfillController.hydrateRequestProperties().then(result => {
				expect(result).to.equal(true);
			});

		});

	});

	describe('execute', () => {
		it('successfully executes a fulfill', () => {

			let session = getValidSession();
			let rebill = getValidRebill();
			let fulfillment_provider = getValidFulfillmentProvider();
			let augmented_transaction_products = getValidAugmentedTransactionProducts(null, true);
			let products = arrayutilities.map(augmented_transaction_products, (augmented_transaction_product, index) => {
				augmented_transaction_products[index].transaction.rebill = rebill.id;
				return MockEntities.getValidProduct(augmented_transaction_product.product.id);
			});

			let vendor_response = getValidVendorResponse();
			let instantiated_fulfillment_provider = getValidInstantiatedFulfillmentProvider();
			let hydrated_augmented_transaction_products = getValidHydratedAugmentedTransactionProducts();
			let customer = getValidCustomer();

			mockery.registerMock(global.SixCRM.routes.path('entities', 'FulfillmentProvider.js'), class {
				get() {
					return Promise.resolve(fulfillment_provider);
				}
				sanitize(argument){
					expect(argument).to.be.a('boolean');
				}
			});

			mockery.registerMock(global.SixCRM.routes.path('entities', 'Rebill.js'), class {
				get() {
					return Promise.resolve(rebill);
				}
				getSession() {
					return Promise.resolve(session);
				}
			});

			mockery.registerMock(global.SixCRM.routes.path('entities', 'Session.js'), class {
				getCustomer() {
					return Promise.resolve(customer);
				}
				get() {
					return Promise.resolve(session);
				}
			});

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

			let mock_vendor = class {
				constructor(){

				}
				fulfill(){
					return Promise.resolve(vendor_response);
				}
			}

			mockery.registerMock(global.SixCRM.routes.path('controllers', 'vendors/fulfillmentproviders/'+fulfillment_provider.provider.name+'/handler.js'), mock_vendor);

			const FulfillController = global.SixCRM.routes.include('helpers', 'shipment/Fulfill.js');
			let fulfillController = new FulfillController();

			fulfillController.parameters.set('instantiatedfulfillmentprovider', instantiated_fulfillment_provider);
			fulfillController.parameters.set('instantiatedfulfillmentprovider', instantiated_fulfillment_provider);
			fulfillController.parameters.set('hydratedaugmentedtransactionproducts', hydrated_augmented_transaction_products);
			fulfillController.parameters.set('customer', customer);

			return fulfillController.execute({
				fulfillment_provider_id: fulfillment_provider.id,
				augmented_transaction_products: augmented_transaction_products
			}).then(result => {
				expect(result).to.deep.equal(vendor_response);
			});

		});
	});

});
