

let chai = require('chai');
let expect = chai.expect;
const mockery = require('mockery');
const MockEntities = global.SixCRM.routes.include('test', 'mock-entities.js');

function getValidVendorResponse(){
	return {
		error: null,
		body: 'Everybody needs somebody.',
		response: {
			body:'<?xml version="1.0" encoding="utf-8"?><soap:Envelope xmlns:soap="http://schemas.xmlsoap.org/soap/envelope/" xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance" xmlns:xsd="http://www.w3.org/2001/XMLSchema"><soap:Body><Int32 xmlns="http://www.JOI.com/schemas/ViaSub.WMS/">1</Int32><warnings xmlns="http://www.JOI.com/schemas/ViaSub.WMS/" /></soap:Body></soap:Envelope>',
			statusCode:200,
			statusMessage:'OK'
		}
	};
}

function getValidTransaction() {
	return MockEntities.getValidTransaction()
}

describe('vendors/merchantproviders/Test/Response.js', () => {

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

	describe('getTransactionID', () => {

		it('throws error when transaction id is not identified', () => {

			let transaction = getValidTransaction();

			const ResponseController = global.SixCRM.routes.include('vendors', 'merchantproviders/Test/Response.js');
			const responseController = new ResponseController({vendor_response: getValidVendorResponse(), action: 'test'});

			try {
				responseController.getTransactionID(transaction)
			} catch (error) {
				expect(error.message).to.equal("[500] Unable to identify the Transaction ID");
			}
		});
	});

	describe('mapResponseMessage', () => {

		it('returns "Success" when response was confirmed successful', () => {

			const ResponseController = global.SixCRM.routes.include('vendors', 'merchantproviders/Test/Response.js');
			const responseController = new ResponseController({vendor_response: getValidVendorResponse(), action: 'test'});

			expect(responseController.mapResponseMessage({parsed_response: {
				success: true,
				response: 1
			}})).to.equal('Success');
		});

		it('return null when response does not contain success confirmation', () => {

			const ResponseController = global.SixCRM.routes.include('vendors', 'merchantproviders/Test/Response.js');
			const responseController = new ResponseController({vendor_response: getValidVendorResponse(), action: 'test'});

			expect(responseController.mapResponseMessage({})).to.equal(null);
		});
	});

	describe('mapResponseCode', () => {

		it('returns "success" when response was confirmed successful', () => {

			const ResponseController = global.SixCRM.routes.include('vendors', 'merchantproviders/Test/Response.js');
			const responseController = new ResponseController({vendor_response: getValidVendorResponse(), action: 'test'});

			expect(responseController.mapResponseCode({parsed_response: {
				success: true,
				response: 1
			}})).to.equal('success');
		});

		it('returns decline when response contains "2"', () => {

			const ResponseController = global.SixCRM.routes.include('vendors', 'merchantproviders/Test/Response.js');
			const responseController = new ResponseController({vendor_response: getValidVendorResponse(), action: 'test'});

			expect(responseController.mapResponseCode({parsed_response: {
				success: false,
				response: 2
			}})).to.equal('decline');
		});

		it('returns error when response does not contain success nor fail confirmation', () => {

			const ResponseController = global.SixCRM.routes.include('vendors', 'merchantproviders/Test/Response.js');
			const responseController = new ResponseController({vendor_response: getValidVendorResponse(), action: 'test'});

			expect(responseController.mapResponseCode({parsed_response: {
				success: false,
				response: null
			}})).to.equal('error');
		});
	});
});
