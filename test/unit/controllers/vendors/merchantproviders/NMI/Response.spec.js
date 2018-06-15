

let chai = require('chai');
let expect = chai.expect;
const mockery = require('mockery');
let querystring = require('querystring');
let du = require('@sixcrm/sixcrmcore/util/debug-utilities').default;
let objectutilities = require('@sixcrm/sixcrmcore/util/object-utilities').default;

const MockEntities = global.SixCRM.routes.include('test', 'mock-entities.js');

describe('/controllers/vendors/merchantproviders/NMI/Response.js', () => {

	describe('getTransactionID', () => {

		xit('successfully returns the transaction ID (results)', () => {

			let transaction = MockEntities.getValidTransaction();
			let transaction_id = JSON.parse(transaction.processor_response).result.transactionid;

			let error = null;
			let response = {};
			let body = '';

			const NMIResponse = global.SixCRM.routes.include('vendors', 'merchantproviders/NMI/Response.js');
			let aNMIResponse = new NMIResponse({error, response, body});

			let result = aNMIResponse.getTransactionID(transaction);

			expect(result).to.equal(transaction_id);

		});

		xit('successfully returns the transaction ID (result)', () => {

			let transaction = MockEntities.getValidTransaction();
			let processor_response = JSON.parse(transaction.processor_response);
			let transaction_id = JSON.parse(transaction.processor_response).result.transactionid;

			processor_response.results = processor_response.result;
			delete processor_response.result;
			transaction.processor_response = JSON.stringify(processor_response);

			let error = null;
			let response = {};
			let body = '';

			const NMIResponse = global.SixCRM.routes.include('vendors', 'merchantproviders/NMI/Response.js');
			let aNMIResponse = new NMIResponse({error, response, body});

			let result = aNMIResponse.getTransactionID(transaction);

			expect(result).to.equal(transaction_id);

		});

	});

});
