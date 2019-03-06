const _ = require('lodash');
const mockery = require('mockery');
let chai = require('chai');
let expect = chai.expect;

const arrayutilities = require('@6crm/sixcrmcore/lib/util/array-utilities').default;

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

	describe('getCloudsearchSearchEndpoint', () => {
		it('gets the cloudsearch domain endpoint', () => {

			mockery.registerMock(global.SixCRM.routes.path('providers', 'cloudsearch-provider.js'),  class {
				constructor(){}
				describeDomains(){
					return Promise.resolve({
						DomainStatusList: [{
							DocService:{
								Endpoint: 'doc-blahblahblah'
							}
						}]
					});
				}
			});

			const acquisition_functions = global.SixCRM.routes.include('config', 'controllers/configuration_acquisition.js');
			return acquisition_functions.getCloudsearchSearchEndpoint().then(result => {
				expect(_.isString(result)).to.equal(true);
				expect(result).to.have.string('doc-');
			});

		});
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
