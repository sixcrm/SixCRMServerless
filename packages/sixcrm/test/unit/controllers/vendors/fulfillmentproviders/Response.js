
const chai = require("chai");
const expect = chai.expect;

const objectutilities = require('@6crm/sixcrmcore/util/object-utilities').default;

describe('vendors/fulfillmentproviders/Response.js', () =>{

	describe('constructor', () => {
		it('successfully constructs', () => {
			const FulfillmentResponse = global.SixCRM.routes.include('vendors', 'fulfillmentproviders/Response.js');
			let fulfillmentResponse = new FulfillmentResponse({error: null, response: {}, body:''});

			expect(objectutilities.getClassName(fulfillmentResponse)).to.equal('FulfillmentProviderVendorResponse');
		});

		it('fails to construct', () => {
			const FulfillmentResponse = global.SixCRM.routes.include('vendors', 'fulfillmentproviders/Response.js');

			try{
				/* eslint-disable */
				let fulfillmentResponse = new FulfillmentResponse();
				/* eslint-enable */

			}catch(error){
				expect(error.message).to.be.defined;
			}
		});

		//Technical Debt:  Write validation against bad constructor arguments...
	});

	describe('getFulfillmentProviderName', () => {
		it('successfully acquires the fulfillment provider name', () => {

			const FulfillmentResponse = global.SixCRM.routes.include('vendors', 'fulfillmentproviders/Response.js');
			let fulfillmentResponse = new FulfillmentResponse({error: null, response: {}, body:''});

			let result = fulfillmentResponse.getFulfillmentProviderName();

			expect(result).to.equal('FulfillmentProviderVendor');

		});
	});


	describe('handleResponse', () => {
		it('successfully handles response when error is null', () => {

			const FulfillmentResponse = global.SixCRM.routes.include('vendors', 'fulfillmentproviders/Response.js');
			let fulfillmentResponse = new FulfillmentResponse({error: null, response: {}, body:''});

			delete fulfillmentResponse.parameters.store['error'];
			delete fulfillmentResponse.parameters.store['response'];
			delete fulfillmentResponse.parameters.store['body'];

			fulfillmentResponse.handleResponse({error: null, response: {}, body:''});
			expect(fulfillmentResponse.parameters.store['error']).to.not.be.defined;

		});

		it('successfully handles response when error is a error', () => {

			const FulfillmentResponse = global.SixCRM.routes.include('vendors', 'fulfillmentproviders/Response.js');
			let fulfillmentResponse = new FulfillmentResponse({error: null, response: {}, body:''});

			delete fulfillmentResponse.parameters.store['error'];
			delete fulfillmentResponse.parameters.store['response'];
			delete fulfillmentResponse.parameters.store['body'];

			let error = new Error('Some message');

			fulfillmentResponse.handleResponse({error: error, response: {}, body:''});
			expect(fulfillmentResponse.parameters.store['error']).to.be.defined;

		});
	});

	describe('setResponseProperties', () => {
		it('successfully sets the response properties', () => {

		});
	});

});
