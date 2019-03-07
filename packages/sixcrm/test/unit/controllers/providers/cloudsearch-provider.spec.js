const chai = require('chai');
const expect = chai.expect;
const mockery = require('mockery');
const objectutilities = require('@6crm/sixcrmcore/lib/util/object-utilities').default;
const AWSTestUtils = require('./aws-test-utils');

describe('controllers/providers/cloudsearch-provider', () => {

	before(() => {
		mockery.resetCache();
		mockery.deregisterAll();

		mockery.enable({
			useCleanCache: true,
			warnOnReplace: false,
			warnOnUnregistered: false
		});

		mockery.registerMock(global.SixCRM.routes.path('controllers', 'providers/redis-provider.js'), class {
			set() {
				return Promise.resolve();
			}
			get() {
				return Promise.resolve('cloudsearch.local');
			}
		});

	});

	after(() => {
		mockery.disable();
	});

	describe('constructor', () => {
		it('successfully constructs', () => {
			const CloudsearchProvider = global.SixCRM.routes.include('controllers', 'providers/cloudsearch-provider.js');
			const cloudsearchprovider = new CloudsearchProvider();
			expect(objectutilities.getClassName(cloudsearchprovider)).to.equal('CloudSearchProvider');
		});
	});

	describe('defineIndexField', () => {

		it('successfully creates index', () => {
			const CloudsearchProvider = global.SixCRM.routes.include('controllers', 'providers/cloudsearch-provider.js');
			const cloudsearchprovider = new CloudsearchProvider();

			cloudsearchprovider.cs = {
				describeDomains: function() {
					return getValidDomains()
				},
				defineIndexField: () => {
					return {
						on: (parameters, response) => {
							response('success');
						},
						send: () => {}
					}
				}
			};

			return cloudsearchprovider.defineIndexField().then((result) => {
				expect(result).to.equal('success');
			});
		});

		it('throws error when index creation failed', () => {
			const CloudsearchProvider = global.SixCRM.routes.include('controllers', 'providers/cloudsearch-provider.js');
			const cloudsearchprovider = new CloudsearchProvider();

			cloudsearchprovider.cs = {
				describeDomains: function() {
					return getValidDomains()
				},
				defineIndexField: () => {
					return {
						on: () => {
							return {
								on: (parameters, response) => {
									response('error');
								}
							}
						},
						send: () => {}
					}
				}
			};

			return cloudsearchprovider.defineIndexField().catch((error) => {
				expect(error.message).to.equal('[500] error');
			});
		});
	});

	describe('createDomain', () => {

		it('successfully creates domain', () => {
			const CloudsearchProvider = global.SixCRM.routes.include('controllers', 'providers/cloudsearch-provider.js');
			const cloudsearchprovider = new CloudsearchProvider();

			cloudsearchprovider.cs = {
				describeDomains: function() {
					return getValidDomains()
				},
				createDomain: () => {
					return {
						on: (parameters, response) => {
							response('success');
						},
						send: () => {}
					}
				}
			};

			return cloudsearchprovider.createDomain().then((result) => {
				expect(result).to.equal('success');
			});
		});

		it('throws error when domain creation failed', () => {
			const CloudsearchProvider = global.SixCRM.routes.include('controllers', 'providers/cloudsearch-provider.js');
			const cloudsearchprovider = new CloudsearchProvider();

			cloudsearchprovider.cs = {
				describeDomains: function() {
					return getValidDomains()
				},
				createDomain: () => {
					return {
						on: () => {
							return {
								on: (parameters, response) => {
									response('error');
								}
							}
						},
						send: () => {}
					}
				}
			};

			return cloudsearchprovider.createDomain().catch((error) => {
				expect(error.message).to.equal('[500] error');
			});
		});
	});

	describe('instantiateCSD', () => {

		it('successfully instantiates CSD', () => {

			const CloudsearchProvider = global.SixCRM.routes.include('controllers', 'providers/cloudsearch-provider.js');
			const cloudsearchprovider = new CloudsearchProvider();

			expect(cloudsearchprovider.instantiateCSD('an_endpoint')).to.equal('an_endpoint');
		});
	});

	describe('describeDomains', () => {

		it('describe domains', () => {

			let valid_domains = getValidDomains();

			const CloudsearchProvider = global.SixCRM.routes.include('controllers', 'providers/cloudsearch-provider.js');
			const cloudsearchprovider = new CloudsearchProvider();

			cloudsearchprovider.cs = {
				describeDomains: AWSTestUtils.AWSPromise(valid_domains)
			};

			return cloudsearchprovider.describeDomains().then((result) => {
				expect(result).to.deep.equal(valid_domains);
			});
		});

		it('throws error from cs describeDomains', () => {

			const CloudsearchProvider = global.SixCRM.routes.include('controllers', 'providers/cloudsearch-provider.js');
			const cloudsearchprovider = new CloudsearchProvider();

			cloudsearchprovider.cs = {
				describeDomains: AWSTestUtils.AWSError('fail')
			};

			return cloudsearchprovider.describeDomains().catch((error) => {
				expect(error.message).to.equal('fail');
			});
		});
	});

	xdescribe('waitFor', () => {

		it('returns true when status is ready', () => {

			const CloudsearchProvider = global.SixCRM.routes.include('controllers', 'providers/cloudsearch-provider.js');
			const cloudsearchprovider = new CloudsearchProvider();

			cloudsearchprovider.cs = {
				describeDomains: function(parameters, callback) {
					callback(null, {DomainStatusList: [{Created: true, Processing: false}]})
				}
			};

			//any number that is not higher than 200
			return cloudsearchprovider.waitFor('ready', null, 200).then((result) => {
				expect(result).to.be.true;
			});
		});

		it('returns true when status is deleted', () => {

			const CloudsearchProvider = global.SixCRM.routes.include('controllers', 'providers/cloudsearch-provider.js');
			const cloudsearchprovider = new CloudsearchProvider();

			cloudsearchprovider.cs = {
				describeDomains: function(parameters, callback) {
					callback(null, {})
				}
			};

			//any number that is not higher than 200
			return cloudsearchprovider.waitFor('deleted', null, 200).then((result) => {
				expect(result).to.be.true;
			});
		});

		it('throws error when max attempt is reached', () => {
			const CloudsearchProvider = global.SixCRM.routes.include('controllers', 'providers/cloudsearch-provider.js');
			const cloudsearchprovider = new CloudsearchProvider();

			//any number higher than 200
			return cloudsearchprovider.waitFor('any_status', 'a_domain_name', 201).catch((error) => {
				expect(error.message).to.equal('[500] Max attempts reached.');
			});
		});
	});

	describe('getDomainNames', () => {

		it('returns object keys for domain names', () => {
			const CloudsearchProvider = global.SixCRM.routes.include('controllers', 'providers/cloudsearch-provider.js');
			const cloudsearchprovider = new CloudsearchProvider();

			cloudsearchprovider.cs = {
				describeDomains: function() {
					return getValidDomains()
				},
				listDomainNames: function(callback) {
					callback(null, {DomainNames: 'a_domain_name'})
				}
			};

			return cloudsearchprovider.getDomainNames().then((result) => {
				expect(result).to.deep.equal(["0","1","2","3","4","5","6","7","8","9","10","11","12"] );
			});
		});

		it('throws error when domain name is not found', () => {
			const CloudsearchProvider = global.SixCRM.routes.include('controllers', 'providers/cloudsearch-provider.js');
			const cloudsearchprovider = new CloudsearchProvider();

			cloudsearchprovider.cs = {
				describeDomains: function() {
					return getValidDomains()
				},
				listDomainNames: function(callback) {
					callback('fail', null)
				}
			};

			return cloudsearchprovider.getDomainNames().catch((error) => {
				expect(error).to.equal('fail');
			});
		});
	});

	describe('deleteDomain', () => {

		it('deletes domain', () => {
			const CloudsearchProvider = global.SixCRM.routes.include('controllers', 'providers/cloudsearch-provider.js');
			const cloudsearchprovider = new CloudsearchProvider();

			cloudsearchprovider.cs = {
				describeDomains: function() {
					return getValidDomains()
				},
				deleteDomain: function(parameters, callback) {
					callback(null, 'success')
				}
			};

			return cloudsearchprovider.deleteDomain().then((result) => {
				expect(result).to.equal('success');
			});
		});

		it('throws error if domain is not deleted', () => {
			const CloudsearchProvider = global.SixCRM.routes.include('controllers', 'providers/cloudsearch-provider.js');
			const cloudsearchprovider = new CloudsearchProvider();

			cloudsearchprovider.cs = {
				describeDomains: function() {
					return getValidDomains()
				},
				deleteDomain: function(parameters, callback) {
					callback('fail', null)
				}
			};

			return cloudsearchprovider.deleteDomain().catch((error) => {
				expect(error).to.equal('fail');
			});
		});
	});

	describe('indexDocuments', () => {

		it('index documents', () => {
			const CloudsearchProvider = global.SixCRM.routes.include('controllers', 'providers/cloudsearch-provider.js');
			const cloudsearchprovider = new CloudsearchProvider();

			cloudsearchprovider.cs = {
				describeDomains: function() {
					return getValidDomains()
				},
				indexDocuments: function(parameters, callback) {
					callback(null, 'success')
				}
			};

			return cloudsearchprovider.indexDocuments().then((result) => {
				expect(result).to.equal('success');
			});
		});

		it('throws error from cs indexDocuments', () => {
			const CloudsearchProvider = global.SixCRM.routes.include('controllers', 'providers/cloudsearch-provider.js');
			const cloudsearchprovider = new CloudsearchProvider();

			cloudsearchprovider.cs = {
				describeDomains: function() {
					return getValidDomains()
				},
				indexDocuments: function(parameters, callback) {
					callback('fail', null)
				}
			};

			return cloudsearchprovider.indexDocuments().catch((error) => {
				expect(error).to.equal('fail');
			});
		});
	});

	xdescribe('uploadDocuments', () => {

		it('uploads documents', () => {
			const CloudsearchProvider = global.SixCRM.routes.include('controllers', 'providers/cloudsearch-provider.js');
			const cloudsearchprovider = new CloudsearchProvider();

			cloudsearchprovider.csd = {
				search: function(parameters, callback) {
					callback(null, 'success')
				},
				uploadDocuments: function(parameters) {
					return Promise.resolve('success');
				}
			};

			return cloudsearchprovider.uploadDocuments().then((result) => {
				expect(result).to.equal('success');
			});
		});

		it('throws error from csd uploadDocuments', () => {
			const CloudsearchProvider = global.SixCRM.routes.include('controllers', 'providers/cloudsearch-provider.js');
			const cloudsearchprovider = new CloudsearchProvider();

			cloudsearchprovider.csd = {
				search: function(parameters, callback) {
					callback(null, 'success')
				},
				uploadDocuments: function(parameters, callback) {
					return Promise.resolve('fail');
				}
			};

			return cloudsearchprovider.uploadDocuments().catch((error) => {
				expect(error).to.equal('fail');
			});
		});
	});

	describe('suggest', () => {

		it('returns result from csd suggest', () => {
			const CloudsearchProvider = global.SixCRM.routes.include('controllers', 'providers/cloudsearch-provider.js');
			const cloudsearchprovider = new CloudsearchProvider();

			cloudsearchprovider.csd = {
				suggest: function(parameters, callback) {
					callback(null, 'success')
				}
			};

			//valid search field 'size'
			return cloudsearchprovider.suggest({size: 'a_size'}).then((result) => {
				expect(result).to.equal('success');
			});
		});

		it('throws error from csd suggest', () => {
			const CloudsearchProvider = global.SixCRM.routes.include('controllers', 'providers/cloudsearch-provider.js');
			const cloudsearchprovider = new CloudsearchProvider();

			cloudsearchprovider.csd = {
				suggest: function(parameters, callback) {
					callback('fail', null)
				}
			};

			//valid search field 'size'
			return cloudsearchprovider.suggest({size: 'a_size'}).catch((error) => {
				expect(error).to.equal('fail');
			});
		});
	});

	describe('executeStatedSearch', () => {

		it('executes stated search', () => {
			const CloudsearchProvider = global.SixCRM.routes.include('controllers', 'providers/cloudsearch-provider.js');
			const cloudsearchprovider = new CloudsearchProvider();

			cloudsearchprovider.csd = {
				search: function(parameters, callback) {
					callback(null, 'success')
				}
			};

			return cloudsearchprovider.executeStatedSearch('any_params').then((result) => {
				expect(result).to.equal('success');
			});
		});

		it('throws error from csd search', () => {
			const CloudsearchProvider = global.SixCRM.routes.include('controllers', 'providers/cloudsearch-provider.js');
			const cloudsearchprovider = new CloudsearchProvider();

			cloudsearchprovider.csd = {
				search: function(parameters, callback) {
					callback('fail', null)
				}
			};

			return cloudsearchprovider.executeStatedSearch('any_params').catch((error) => {
				expect(error).to.equal('fail');
			});
		});
	});

	describe('search', () => {

		it('executes search', () => {
			const CloudsearchProvider = global.SixCRM.routes.include('controllers', 'providers/cloudsearch-provider.js');
			const cloudsearchprovider = new CloudsearchProvider();

			cloudsearchprovider.csd = {
				search: function(parameters, callback) {
					callback(null, 'success')
				}
			};

			//valid search field 'size'
			return cloudsearchprovider.search({size: 'a_size'}).then((result) => {
				expect(result).to.equal('success');
			});
		});

		it('throws error from csd search', () => {
			const CloudsearchProvider = global.SixCRM.routes.include('controllers', 'providers/cloudsearch-provider.js');
			const cloudsearchprovider = new CloudsearchProvider();

			cloudsearchprovider.csd = {
				search: function(parameters, callback) {
					callback('fail', null)
				}
			};

			//valid search field 'size'
			return cloudsearchprovider.search({size: 'a_size'}).catch((error) => {
				expect(error).to.equal('fail');
			});
		});
	});

	xdescribe('waitForCSD', () => {

		it('wait for CSD connection', () => {
			const CloudsearchProvider = global.SixCRM.routes.include('controllers', 'providers/cloudsearch-provider.js');
			const cloudsearchprovider = new CloudsearchProvider();

			cloudsearchprovider.csd = {
				search: function(parameters, callback) {
					callback(null, 'success')
				}
			};

			//when count number is less than 50
			return cloudsearchprovider.waitForCSD(49).then((result) => {
				expect(result).to.be.true;
			});
		});

		it('throws error when connection with CSD is not established', () => {
			const CloudsearchProvider = global.SixCRM.routes.include('controllers', 'providers/cloudsearch-provider.js');
			const cloudsearchprovider = new CloudsearchProvider();

			//when count number is more than or equal to 50 throw error
			try{
				cloudsearchprovider.waitForCSD(51)
			}catch(error){
				expect(error.message).to.equal('[500] Unable to establish connection to Cloudsearch Document endpoint.');
			}
		});
	});

	describe('setDomainName', () => {

		it('successfully sets domain name for test mode', () => {

			process.env.TEST_MODE = 'true';

			const CloudsearchProvider = global.SixCRM.routes.include('controllers', 'providers/cloudsearch-provider.js');
			const cloudsearchprovider = new CloudsearchProvider();

			let result = cloudsearchprovider.setDomainName();

			expect(result).to.be.true;
			expect(cloudsearchprovider.domainname).to.equal('cloudsearch.local');
		});
	});

	xdescribe('CSDExists', () => {

		it('returns true when CSD exists', () => {

			const CloudsearchProvider = global.SixCRM.routes.include('controllers', 'providers/cloudsearch-provider.js');
			const cloudsearchprovider = new CloudsearchProvider();

			expect(cloudsearchprovider.CSDExists()).to.be.true;
		});

		it('returns false when CSD does not exist', () => {

			const CloudsearchProvider = global.SixCRM.routes.include('controllers', 'providers/cloudsearch-provider.js');
			const cloudsearchprovider = new CloudsearchProvider();

			delete cloudsearchprovider.csd;

			expect(cloudsearchprovider.CSDExists()).to.be.false;
		});
	});

	function getValidDomains() {
		return {DomainStatusList: [{DocService:{Endpoint: 'cloudsearch.domain'}}]};
	}
});
