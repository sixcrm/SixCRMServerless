const _ = require('lodash');
const mockery = require('mockery');
let chai = require('chai');
let expect = chai.expect;

const arrayutilities = require('@6crm/sixcrmcore/util/array-utilities').default;

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

	describe('getLambdaSubnets', () => {
		it('gets a array of lambda subnet ids', () => {

			mockery.registerMock(global.SixCRM.routes.path('providers', 'ec2-provider.js'),  class {
				constructor(){}
				describeSubnets(){
					return Promise.resolve({
						Subnets: [{
							SubnetId: 'subnet-123456'
						}]
					});
				}
			});

			const acquisition_functions = global.SixCRM.routes.include('config', 'controllers/configuration_acquisition.js');
			return acquisition_functions.getLambdaSubnets().then(result => {
				expect(_.isArray(result)).to.equal(true);
				arrayutilities.map(result, subnet_id => {
					expect(_.isString(subnet_id)).to.equal(true);
					expect(subnet_id).to.have.string('subnet-');
				});
			});

		});
	});

	describe('getLambdaSecurityGroup', () => {
		it('gets the lambda security group', () => {

			mockery.registerMock(global.SixCRM.routes.path('providers', 'ec2-provider.js'),  class {
				constructor(){}
				describeSecurityGroups(){
					return Promise.resolve({
						SecurityGroups: [{
							GroupId: 'sg-12345678'
						}]
					});
				}
			});

			const acquisition_functions = global.SixCRM.routes.include('config', 'controllers/configuration_acquisition.js');
			return acquisition_functions.getLambdaSecurityGroup().then(result => {
				expect(_.isString(result)).to.equal(true);
				expect(result).to.have.string('sg-');
			});

		});
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

			mockery.registerMock(global.SixCRM.routes.path('providers', 'rds-provider.js'),  class {
				constructor(){}
				describeClusters(){
					return Promise.resolve({
						DBClusters: [{
							Endpoint: 'cluster-something'
						}]
					});
				}
			});

			const acquisition_functions = global.SixCRM.routes.include('config', 'controllers/configuration_acquisition.js');
			return acquisition_functions.getAuroraClusterEndpoint().then(result => {
				expect(_.isString(result)).to.equal(true);
				expect(result).to.have.string('cluster-');
			});

		});
	});

});
