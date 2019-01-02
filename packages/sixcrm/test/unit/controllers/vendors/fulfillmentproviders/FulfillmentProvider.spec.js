
const chai = require("chai");
const expect = chai.expect;
const objectutilities = require('@6crm/sixcrmcore/util/object-utilities').default;
const stringutilities = require('@6crm/sixcrmcore/util/string-utilities').default;
const MockEntities = global.SixCRM.routes.include('test', 'mock-entities.js');

function getValidFulfillmentProvider() {
	return MockEntities.getValidFulfillmentProvider()
}

function getValidShippingReceipt() {
	return MockEntities.getValidShippingReceipt()
}

describe('vendors/fulfillmentproviders/FulfillmentProvider.js', () =>{
	describe('constructor', () => {

		it('successfully constructs', () => {

			let FulfillmentProviderController = global.SixCRM.routes.include('vendors', 'fulfillmentproviders/FulfillmentProvider.js');
			let fulfillmentProviderController = new FulfillmentProviderController({fulfillment_provider: getValidFulfillmentProvider()});

			expect(objectutilities.getClassName(fulfillmentProviderController)).to.equal('fulfillmentProviderController');
		})
	});

	describe('getVendorName', () => {

		it('successfully retrieves vendor name', () => {

			let FulfillmentProviderController = global.SixCRM.routes.include('controllers', 'vendors/fulfillmentproviders/FulfillmentProvider.js');
			let fulfillmentProviderController = new FulfillmentProviderController({fulfillment_provider: getValidFulfillmentProvider()});

			expect(fulfillmentProviderController.getVendorName()).to.equal('fulfillmentProvider');
		})
	});

	describe('createReferenceNumber', () => {

		it('creates reference number', () => {

			let FulfillmentProviderController = global.SixCRM.routes.include('controllers', 'vendors/fulfillmentproviders/FulfillmentProvider.js');
			let fulfillmentProviderController = new FulfillmentProviderController({fulfillment_provider: getValidFulfillmentProvider()});

			let reference_number = fulfillmentProviderController.createReferenceNumber();

			expect(stringutilities.isUUID(reference_number)).to.be.true;
		})
	});

	describe('augmentParameters', () => {

		it('successfully augments parameters', () => {

			let FulfillmentProviderController = global.SixCRM.routes.include('controllers', 'vendors/fulfillmentproviders/FulfillmentProvider.js');
			let fulfillmentProviderController = new FulfillmentProviderController({fulfillment_provider: getValidFulfillmentProvider()});

			expect(fulfillmentProviderController.augmentParameters()).to.equal(true);
			expect(fulfillmentProviderController.parameter_validation).to.be.defined;
			expect(fulfillmentProviderController.parameter_definition).to.be.defined;
		})
	});

	describe('setReferenceNumber', () => {

		it('successfully sets reference number from shipping receipt', () => {

			let shipping_receipt = getValidShippingReceipt();

			let FulfillmentProviderController = global.SixCRM.routes.include('controllers', 'vendors/fulfillmentproviders/FulfillmentProvider.js');
			let fulfillmentProviderController = new FulfillmentProviderController({fulfillment_provider: getValidFulfillmentProvider()});

			fulfillmentProviderController.parameters.set('shippingreceipt', shipping_receipt);

			expect(fulfillmentProviderController.setReferenceNumber()).to.equal(true);
			expect(fulfillmentProviderController.parameters.store['referencenumber']).to.equal(shipping_receipt.fulfillment_provider_reference);
		});

		it('successfully creates and sets reference number', () => {

			let FulfillmentProviderController = global.SixCRM.routes.include('controllers', 'vendors/fulfillmentproviders/FulfillmentProvider.js');
			let fulfillmentProviderController = new FulfillmentProviderController({fulfillment_provider: getValidFulfillmentProvider()});

			fulfillmentProviderController.parameters.set('shippingreceipt', null);

			expect(fulfillmentProviderController.setReferenceNumber()).to.equal(true);

			let reference_number = fulfillmentProviderController.parameters.store['referencenumber'];

			expect(stringutilities.isUUID(reference_number)).to.be.true;
		})
	});
});
