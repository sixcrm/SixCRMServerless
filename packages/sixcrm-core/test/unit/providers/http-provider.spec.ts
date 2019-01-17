import * as chai from 'chai';
const expect = chai.expect;
import * as mockery from 'mockery';

describe('controllers/providers/http-provider', () => {

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

	describe('createQueryString', () => {

		it('creates query string', () => {

			const response = {
				a_query_string: 'test123'
			};

			const HttpProvider = require('../../../src/providers/http-provider').default;
			const httpprovider = new HttpProvider();

			expect(httpprovider.createQueryString(response)).to.equal('a_query_string=test123');
		});
	});

	describe('resolveRequest', () => {

		it('successfully resolves request', () => {

			const response_object = {
				error: null,
				response: 'a_response',
				body: {}
			};

			mockery.registerMock('request', (request_options, callback) => {
				return callback(response_object.error, response_object.response, response_object.body);
			});

			const HttpProvider = require('../../../src/providers/http-provider').default;
			const httpprovider = new HttpProvider();

			return httpprovider.resolveRequest().then((result) => {
				expect(result).to.deep.equal(response_object);
			});
		});

		it('throws error when request was not resolved', () => {

			const response_object = {
				error: new Error('fail'),
				response: 'failed',
				body: {}
			};

			mockery.registerMock('request', (request_options, callback) => {
				return callback(response_object.error, response_object.response, response_object.body);
			});

			const HttpProvider = require('../../../src/providers/http-provider').default;
			const httpprovider = new HttpProvider();

			return httpprovider.resolveRequest().catch((error) => {
				expect(error.message).to.be.undefined;
			});
		});
	});

	describe('getJSON', () => {

		it('successfully retrieves JSON', () => {

			const response_object = {
				error: null,
				response: 'a_response',
				body: {}
			};

			mockery.registerMock('request', (request_options, callback) => {
				expect(request_options).to.have.property('method');
				expect(request_options.method).to.equal('get');
				expect(request_options).to.have.property('json');
				expect(request_options.json).to.equal(true);
				return callback(response_object.error, response_object.response, response_object.body);
			});

			const HttpProvider = require('../../../src/providers/http-provider').default;
			const httpprovider = new HttpProvider();

			return httpprovider.getJSON({}).then((result) => {
				expect(result).to.deep.equal(response_object);
			});
		});
	});

	describe('postJSON', () => {

		it('successfully creates JSON', () => {

			const response_object = {
				error: null,
				response: 'a_response',
				body: {}
			};

			mockery.registerMock('request', (request_options, callback) => {
				expect(request_options).to.have.property('method');
				expect(request_options.method).to.equal('post');
				expect(request_options).to.have.property('json');
				expect(request_options.json).to.equal(true);
				expect(request_options).to.have.property('headers');
				expect(request_options.headers['Content-Type']).to.equal('application/json');
				return callback(response_object.error, response_object.response, response_object.body);
			});

			const HttpProvider = require('../../../src/providers/http-provider').default;
			const httpprovider = new HttpProvider();

			return httpprovider.postJSON({}).then((result) => {
				expect(result).to.deep.equal(response_object);
			});
		});
	});
});
