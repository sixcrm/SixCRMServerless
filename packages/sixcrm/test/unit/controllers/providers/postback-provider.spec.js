const chai = require("chai");
const expect = chai.expect;
const mockery = require('mockery');

describe('controllers/providers/postback-provider', () => {

	before(() => {
		mockery.enable({
			useCleanCache: true,
			warnOnReplace: false,
			warnOnUnregistered: false
		});
	});

	afterEach(() => {
		mockery.resetCache();
	});

	after(() => {
		mockery.deregisterAll();
		mockery.disable();
	});

	describe('executeRequest', () => {

		it('successfully executes get request', () => {

			let url = 'test';

			let response = 'success';

			mockery.registerMock('request', {
				get: (request_options, callback) => {
					callback(null, response);
				}
			});

			const PostbackProvider = global.SixCRM.routes.include('controllers', 'providers/postback-provider.js');
			const postbackprovider = new PostbackProvider();

			return postbackprovider.executeRequest(url).then((result) => {
				expect(result).to.equal(response);
			});
		});

		it('throws error when request is unsuccessfully executed', () => {

			let url = 'test';

			mockery.registerMock('request', {
				get: (request_options, callback) => {
					callback('fail', null);
				}
			});

			const PostbackProvider = global.SixCRM.routes.include('controllers', 'providers/postback-provider.js');
			const postbackprovider = new PostbackProvider();

			return postbackprovider.executeRequest(url).catch((error) => {
				expect(error).to.equal('fail');
			});
		});
	});

	describe('executePostback', () => {

		it('successfully executes postback', () => {

			let url = 'test';

			let response = 'success';

			mockery.registerMock('request', {
				get: (request_options, callback) => {
					callback(null, response);
				}
			});

			const PostbackProvider = global.SixCRM.routes.include('controllers', 'providers/postback-provider.js');
			const postbackprovider = new PostbackProvider();

			return postbackprovider.executePostback(url).then((result) => {
				expect(result).to.equal(response);
			});
		});
	});
});
