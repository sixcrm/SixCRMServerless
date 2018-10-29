
const chai = require("chai");
const expect = chai.expect;
const querystring = require('querystring');
const mockery = require('mockery');
const objectutilities = require('@6crm/sixcrmcore/util/object-utilities').default;
const spoofer = global.SixCRM.routes.include('test', 'spoofer.js');
const MockEntities = global.SixCRM.routes.include('test', 'mock-entities.js');

function getValidShippingReceipt() {
	return MockEntities.getValidShippingReceipt();
}

function getValidFulfillmentProviderReference() {
	return 'a858a0dd-3c12-4fcd-9f56-53fe939546ca';
}

function getValidFulfillmentProvider(id) {

	return MockEntities.getValidFulfillmentProvider(id, 'shipstation');

}

function getValidCustomer() {
	return MockEntities.getValidCustomer();
}

function getValidProducts() {
	return MockEntities.getValidProducts();
}

function getValidResponse() {

	let body = {
		orderId: 185148831,
		orderNumber: "a858a0dd-3c12-4fcd-9f56-53fe939546ca",
		orderKey: "a858a0dd-3c12-4fcd-9f56-53fe939546ca",
		orderDate: "2018-01-25T17:42:12.9570000",
		createDate: "2018-01-25T17:42:13.4070000",
		modifyDate: "2018-01-25T17:42:13.4070000",
		paymentDate: null,
		shipByDate: null,
		orderStatus: "awaiting_shipment",
		customerId: null,
		customerUsername: null,
		customerEmail: null,
		billTo: {
			name: "Caden Larson",
			company: null,
			street1: "246 Jarrod Curve",
			street2: null,
			street3: null,
			city: "Lake Katrine",
			state: "TX",
			postalCode: "63441-7146",
			country: "BE",
			phone: "1-299-770-8971 x0389",
			residential: null,
			addressVerified: null
		},
		shipTo: {
			name: "Caden Larson",
			company: null,
			street1: "246 Jarrod Curve",
			street2: null,
			street3: null,
			city: "Lake Katrine",
			state: "TX",
			postalCode: "63441-7146",
			country: "BE",
			phone: "1-299-770-8971 x0389",
			residential: false,
			addressVerified: "Address validation warning"
		},
		items: [{
			orderItemId: 249618155,
			lineItemKey: null,
			sku: "PYHAC58UQ9M1X2DC51M2",
			name: "HF4UA41TTS48WYBVBU2K",
			imageUrl: null,
			weight: null,
			quantity: 1,
			unitPrice: 0.00,
			taxAmount: null,
			shippingAmount: null,
			warehouseLocation: null,
			options: [],
			productId: null,
			fulfillmentSku: "PYHAC58UQ9M1X2DC51M2",
			adjustment: false,
			upc: null,
			createDate: "2018-01-25T17:42:13.407",
			modifyDate: "2018-01-25T17:42:13.407"
		},
		{
			orderItemId: 249618156,
			lineItemKey: null,
			sku: "1H4N83GSCKFD184YC7RH",
			name: "U655BCP7N4S8LQ42RKN6",
			imageUrl: null,
			weight: null,
			quantity: 1,
			unitPrice: 0.00,
			taxAmount: null,
			shippingAmount: null,
			warehouseLocation: null,
			options: [],
			productId: null,
			fulfillmentSku: "1H4N83GSCKFD184YC7RH",
			adjustment: false,
			upc: null,
			createDate: "2018-01-25T17:42:13.407",
			modifyDate: "2018-01-25T17:42:13.407"
		},
		{
			orderItemId: 249618157,
			lineItemKey: null,
			sku: "G279EWATGFVQDDKQ5KGH",
			name: "YU6CP3SC2EVQDYA9UELU",
			imageUrl: null,
			weight: null,
			quantity: 1,
			unitPrice: 0.00,
			taxAmount: null,
			shippingAmount: null,
			warehouseLocation: null,
			options: [],
			productId: null,
			fulfillmentSku: "G279EWATGFVQDDKQ5KGH",
			adjustment: false,
			upc: null,
			createDate: "2018-01-25T17:42:13.407",
			modifyDate: "2018-01-25T17:42:13.407"
		}
		],
		orderTotal: 0.00,
		amountPaid: 0.00,
		taxAmount: 0.00,
		shippingAmount: 0.00,
		customerNotes: null,
		internalNotes: null,
		gift: false,
		giftMessage: null,
		paymentMethod: null,
		requestedShippingService: null,
		carrierCode: null,
		serviceCode: null,
		packageCode: null,
		confirmation: "none",
		shipDate: null,
		holdUntilDate: null,
		weight: {
			value: 0.00,
			units: "ounces",
			WeightUnits: 1
		},
		dimensions: null,
		insuranceOptions: {
			provider: null,
			insureShipment: false,
			insuredValue: 0.0
		},
		internationalOptions: {
			contents: "merchandise",
			customsItems: null,
			nonDelivery: "return_to_sender"
		},
		advancedOptions: {
			warehouseId: null,
			nonMachinable: false,
			saturdayDelivery: false,
			containsAlcohol: false,
			mergedOrSplit: false,
			mergedIds: [],
			parentId: null,
			storeId: 249017,
			customField1: null,
			customField2: null,
			customField3: null,
			source: null,
			billToParty: null,
			billToAccount: null,
			billToPostalCode: null,
			billToCountryCode: null,
			billToMyOtherAccount: null
		},
		tagIds: null,
		userId: null,
		externallyFulfilled: false,
		externallyFulfilledBy: null,
		labelMessages: null
	};

	return {
		error: null,
		body: body,
		response: {
			statusCode: 200,
			statusMessage: 'OK',
			body: body
		}
	};

}

function getValidBadResponse() {

	return {
		error: null,
		body: '401 Unauthorized',
		response: {
			statusCode: 401,
			statusMessage: 'Unauthorized',
			body: '401 Unauthorized'
		}
	};

}

function getValidGoodResponse() {

	return {
		error: null,
		body: {
			fulfillments: [],
			total: 0,
			page: 1,
			pages: 0
		},
		response: {
			statusCode: 200,
			statusMessage: 'OK',
			body: {
				fulfillments: [],
				total: 0,
				page: 1,
				pages: 0
			}
		}
	};

}

describe('vendors/fulfillmentproviders/ShipStation/handler.js', () => {

	before(() => {

		mockery.enable({
			useCleanCache: true,
			warnOnReplace: false,
			warnOnUnregistered: false
		});

	});

	beforeEach(() => {

		mockery.registerMock(global.SixCRM.routes.path('controllers', 'providers/dynamodb-provider.js'), class {});

	});

	afterEach(() => {
		mockery.resetCache();
		mockery.deregisterAll();
	});

	after(() => {
		mockery.disable();
	});

	describe('constructor', () => {

		it('successfully constructs', () => {

			let fulfillment_provider = getValidFulfillmentProvider();

			const ShipStationController = global.SixCRM.routes.include('vendors', 'fulfillmentproviders/ShipStation/handler.js');
			let shipStationController = new ShipStationController({
				fulfillment_provider: fulfillment_provider
			});

			expect(objectutilities.getClassName(shipStationController)).to.equal('ShipStationController');
			expect(shipStationController.parameters.store['fulfillmentprovider']).to.deep.equal(fulfillment_provider);

		});

	});

	describe('createAuthorizationString', () => {

		it('Successfully creates a authorization string', () => {

			let fulfillment_provider = getValidFulfillmentProvider();

			fulfillment_provider.provider.api_key = 'ShipStation';
			fulfillment_provider.provider.api_secret = 'Rocks';

			const ShipStationController = global.SixCRM.routes.include('vendors', 'fulfillmentproviders/ShipStation/handler.js');
			let shipStationController = new ShipStationController({
				fulfillment_provider: fulfillment_provider
			});

			expect(shipStationController.createAuthorizationString()).to.deep.equal('Basic U2hpcFN0YXRpb246Um9ja3M=');

		});

	});

	describe('test', () => {

		it('successfully executes a test to failure', () => {

			let fulfillment_provider = getValidFulfillmentProvider();

			fulfillment_provider.provider.api_key = 'ShipStation';
			fulfillment_provider.provider.api_secret = 'Rocks';

			let bad_response = getValidBadResponse();

			mockery.registerMock('@6crm/sixcrmcore/providers/http-provider', {
				default: class {
					getJSON() {
						return Promise.resolve(bad_response);
					}
					createQueryString(querystring_object) {
						return querystring.stringify(querystring_object);
					}
				}
			});

			const ShipStationController = global.SixCRM.routes.include('vendors', 'fulfillmentproviders/ShipStation/handler.js');
			let shipStationController = new ShipStationController({
				fulfillment_provider: fulfillment_provider
			});

			return shipStationController.test().then(result => {

				expect(objectutilities.getClassName(result)).to.equal('ShipStationResponse');
				expect(result.getCode()).to.equal('fail');
				expect(result.getMessage()).to.equal('Failed');
				expect(result.getResponse().body).to.equal('401 Unauthorized');
				return expect(result.getParsedResponse()).to.be.defined;

			});

		});

		it('successfully executes a test to success', () => {

			let fulfillment_provider = getValidFulfillmentProvider();

			fulfillment_provider.provider.api_key = '7836433d83cc4c79ac45df5346754e0c';
			fulfillment_provider.provider.api_secret = '4890d92038de4476aa9b1f9c22213bbb';

			let good_response = getValidGoodResponse();

			mockery.registerMock('@6crm/sixcrmcore/providers/http-provider', {
				default: class {
					getJSON() {
						return Promise.resolve(good_response);
					}
					createQueryString(querystring_object) {
						return querystring.stringify(querystring_object);
					}
				}
			});

			const ShipStationController = global.SixCRM.routes.include('vendors', 'fulfillmentproviders/ShipStation/handler.js');
			let shipStationController = new ShipStationController({
				fulfillment_provider: fulfillment_provider
			});

			return shipStationController.test().then(result => {

				expect(objectutilities.getClassName(result)).to.equal('ShipStationResponse');
				expect(result.getCode()).to.equal('success');
				expect(result.getMessage()).to.equal('Success');
				expect(result.getResponse().body).to.deep.equal(good_response.response.body);
				return expect(result.getParsedResponse()).to.be.defined;

			});

		});

	});

	describe('fulfill', () => {

		it('successfully executes a fulfill to failure', () => {

			let fulfillment_provider = getValidFulfillmentProvider();
			//fulfillment_provider.provider.api_key = '7836433d83cc4c79ac45df5346754e0c';
			//fulfillment_provider.provider.api_secret = '4890d92038de4476aa9b1f9c22213bbb';

			let good_response = getValidResponse();

			let customer = getValidCustomer();
			let products = getValidProducts();

			mockery.registerMock('@6crm/sixcrmcore/providers/http-provider', {
				default: class {
					postJSON() {
						return Promise.resolve(good_response);
					}
					createQueryString(querystring_object) {
						return querystring.stringify(querystring_object);
					}
				}
			});

			const ShipStationController = global.SixCRM.routes.include('vendors', 'fulfillmentproviders/ShipStation/handler.js');
			let shipStationController = new ShipStationController({
				fulfillment_provider: fulfillment_provider
			});

			return shipStationController.fulfill({
				customer: customer,
				products: products
			}).then(result => {

				expect(objectutilities.getClassName(result)).to.equal('ShipStationResponse');
				expect(result.getCode()).to.equal('success');
				expect(result.getMessage()).to.equal('Success');
				expect(result.getResponse().body).to.deep.equal(good_response.response.body);
				return expect(result.getParsedResponse()).to.be.defined;

			});

		});

	});

	describe('info', () => {

		it('successfully executes a info request', () => {

			let fulfillment_provider = getValidFulfillmentProvider();
			//fulfillment_provider.provider.api_key = '7836433d83cc4c79ac45df5346754e0c';
			//fulfillment_provider.provider.api_secret = '4890d92038de4476aa9b1f9c22213bbb';

			let shipping_receipt = getValidShippingReceipt();

			shipping_receipt.fulfillment_provider_reference = getValidFulfillmentProviderReference();

			let good_response = getValidGoodResponse();

			mockery.registerMock('@6crm/sixcrmcore/providers/http-provider', {
				default: class {
					getJSON() {
						return Promise.resolve(good_response);
					}
					createQueryString(querystring_object) {
						return querystring.stringify(querystring_object);
					}
				}
			});

			const ShipStationController = global.SixCRM.routes.include('vendors', 'fulfillmentproviders/ShipStation/handler.js');
			let shipStationController = new ShipStationController({
				fulfillment_provider: fulfillment_provider
			});

			return shipStationController.info({
				shipping_receipt: shipping_receipt
			}).then(result => {

				expect(objectutilities.getClassName(result)).to.equal('ShipStationResponse');
				expect(result.getCode()).to.equal('success');
				expect(result.getMessage()).to.equal('Success');
				expect(result.getResponse().body).to.deep.equal(good_response.response.body);
				return expect(result.getParsedResponse()).to.be.defined;

			});

		});

	});

	describe('getCreateOrderRequestParameters', () => {

		it('successfully creates request parameters for "CreateOrder"', () => {

			let fulfillment_provider = getValidFulfillmentProvider();

			let customer = getValidCustomer();

			let products = getValidProducts();

			let reference_number = getValidFulfillmentProviderReference();

			customer.address.line2 = spoofer.createRandomAddress('line2');

			const ShipStationController = global.SixCRM.routes.include('vendors', 'fulfillmentproviders/ShipStation/handler.js');
			let shipStationController = new ShipStationController({
				fulfillment_provider: fulfillment_provider
			});

			shipStationController.parameters.set('customer', customer);
			shipStationController.parameters.set('products', products);
			shipStationController.parameters.set('referencenumber', reference_number);

			const expected_customer_data = {
				city: customer.address.city,
				company: null,
				country: customer.address.country,
				email: customer.email,
				name: customer.firstname + ' ' + customer.lastname,
				phone: customer.phone,
				postalCode: customer.address.zip,
				state: customer.address.state,
				street1: customer.address.line1,
				street2: customer.address.line2,
				street3: null
			};

			let result = shipStationController.getCreateOrderRequestParameters();

			expect(result.orderNumber).to.equal(reference_number);
			expect(result.orderKey).to.equal(reference_number);
			expect(result.orderStatus).to.equal('awaiting_shipment');
			expect(result.customerEmail).to.equal(customer.email);
			expect(result.customerUsername).to.equal(customer.email);
			expect(result.billTo).to.deep.equal(expected_customer_data);
			expect(result.shipTo).to.deep.equal(expected_customer_data);

			products.forEach((product, index) => {
				expect(result.items[index]).to.deep.equal({
					fulfillmentSku: null,
					name: product.name,
					quantity: 1,
					sku: product.sku,
				});
			});
		});

	});

});
