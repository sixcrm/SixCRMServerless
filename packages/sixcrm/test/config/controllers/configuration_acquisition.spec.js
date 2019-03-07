const _ = require('lodash');
const mockery = require('mockery');
let chai = require('chai');
let expect = chai.expect;

describe('/config/controllers/configuration_acquisition.js', () => {

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
	});

	describe('getAuroraClusterEndpoint', () => {
		it('gets the aurora cluster endpoint', () => {

			const acquisition_functions = global.SixCRM.routes.include('config', 'controllers/configuration_acquisition.js');

			const result = acquisition_functions.getAuroraClusterEndpoint();
			expect(_.isString(result)).to.equal(true);
			expect(result).to.have.string('aurora');

		});
	});

});
