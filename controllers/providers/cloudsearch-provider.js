const _ = require('lodash');
const du = global.SixCRM.routes.include('lib', 'debug-utilities.js');
const eu = global.SixCRM.routes.include('lib', 'error-utilities.js');
const objectutilities = global.SixCRM.routes.include('lib', 'object-utilities.js');
const stringutilities = global.SixCRM.routes.include('lib', 'string-utilities.js');
const AWSProvider = global.SixCRM.routes.include('controllers', 'providers/aws-provider.js');

module.exports = class CloudSearchProvider extends AWSProvider {

	constructor(instantiate_csd) {

		super();

		instantiate_csd = (_.isUndefined(instantiate_csd) || _.isNull(instantiate_csd)) ? true : instantiate_csd;

		this.max_attempts = 200;

		this.setDomainName();

		//Technical Debt:  The cloudsearch provider should be two classes, query and deploy
		if (instantiate_csd) {
			this.setCloudsearchDomainEndpoint();
		}

		//Technical Debt:  Get this out of the constructor...
		this.instantiateAWS();

		this.cs = new this.AWS.CloudSearch({
			region: this.getRegion(),
			apiVersion: '2013-01-01'
		});

		this.search_fields = [
			'query',
			'cursor',
			'expr',
			'facet',
			'filterQuery',
			'highlight',
			'partial',
			'queryOptions',
			'queryParser',
			'return',
			'size',
			'sort',
			'start',
			'stats'
		];

		this.suggest_fields = [
			'query',
			'suggester',
			'size'
		];

	}

	setCloudsearchDomainEndpoint() {

		du.debug('Set Cloudsearch Domain Endpoint');

		return global.SixCRM.configuration.getEnvironmentConfig('cloudsearch_domainendpoint').then((endpoint) => {

			if (endpoint) {

				return this.instantiateCSD(endpoint);

			}

			return;

		});

	}

	instantiateCSD(endpoint) {

		this.instantiateAWS();

		this.csd = new this.AWS.CloudSearchDomain({
			region: this.getRegion(),
			apiVersion: '2013-01-01',
			endpoint: endpoint
		});

		return endpoint;

	}

	CSDExists() {

		du.debug('CSD Exists');

		if (_.has(this, 'csd') && _.isFunction(this.csd.search)) {
			return true;
		}

		return false;

	}

	setDomainName() {

		du.debug('Set Domain Name');

		if (process.env.TEST_MODE === 'true') {
			du.debug('Test Mode');
			this.domainname = 'cloudsearch.local';

			return true;
		}

		if (_.has(global.SixCRM.configuration.site_config, 'cloudsearch') && _.has(global.SixCRM.configuration.site_config.cloudsearch, 'domainname')) {

			this.domainname = global.SixCRM.configuration.site_config.cloudsearch.domainname;

			return true;

		}


		throw eu.getError('server', 'Unable to determine configured CloudSearch domain name.');

	}

	search(search_parameters) {

		du.debug('Search');

		let params = {};

		for (var k in search_parameters) {
			if (_.includes(this.search_fields, k)) {
				params[k] = search_parameters[k];
			}
		}

		return this.executeStatedSearch(params);

	}

	executeStatedSearch(parameters) {

		du.debug('Execute Stated Search');

		return new Promise((resolve, reject) => {

			if (this.CSDExists()) {

				du.info(parameters);

				this.csd.search(parameters, function(error, data) {

					if (error) {

						return reject(error);

					} else {

						du.debug('Raw search results:', data);

						return resolve(data);

					}

				});

			} else {

				return this.setCloudsearchDomainEndpoint()
					.then(() => this.executeStatedSearch(parameters))
					.then((result) => resolve(result));

			}

		});

	}

	suggest(suggest_parameters) {

		return new Promise((resolve, reject) => {

			du.warning(suggest_parameters);

			let params = {};

			for (var k in suggest_parameters) {
				if (_.includes(this.suggest_fields, k)) {
					params[k] = suggest_parameters[k];
				}
			}

			this.csd.suggest(params, function(error, data) {

				if (error) {
					return reject(error);
				} else {
					return resolve(data);
				}

			});

		});

	}

	uploadDocuments(structured_documents) {

		du.debug('Uploading documents to Cloudsearch', structured_documents);

		return new Promise((resolve, reject) => {

			let params = {
				contentType: 'application/json',
				documents: structured_documents
			};

			du.debug('Cloudsearch Parameters', params);

			return this.csd.uploadDocuments(params, (error, data) => {
				if (error) {
					//du.warning('Cloudsearch error: ', error);
					return reject(error);
				}
				//du.debug('Successful Indexing:', data);
				return resolve(data);
			});

		});

	}

	defineIndexField(index_object) {

		du.debug('Define Index Field');

		return new Promise((resolve) => {

			let handle = this.cs.defineIndexField(index_object);

			handle.on('success', (response) => {
				du.info('Create Index Success');
				return resolve(response);
			})
				.on('error', (response) => {
					du.error('Create Index Error', index_object);
					throw eu.getError('server', response);
				})
				.send();

		});

	}

	describeDomains(domainnames) {

		du.debug('Describe Domains');

		if (process.env.TEST_MODE === 'true') {
			du.debug('Test Mode');

			return Promise.resolve(this.AWSCallback(null, {
				DomainStatusList: [{
					DocService: {
						Endpoint: 'cloudsearch.domain'
					}
				}]
			}));
		}

		return new Promise((resolve) => {

			if (_.isUndefined(domainnames)) {
				domainnames = [this.domainname];
			}

			var parameters = {
				DomainNames: domainnames
			};

			return this.cs.describeDomains(parameters, (error, data) => resolve(this.AWSCallback(error, data)));

		});

	}

	createDomain(domainname) {

		return new Promise((resolve) => {

			if (_.isUndefined(domainname)) {

				domainname = this.domainname

			}

			let parameters = {
				DomainName: domainname,
			};

			let handle = this.cs.createDomain(parameters);

			handle.on('success', (response) => {
				du.info('Create Domain Success');
				return resolve(response);
			})
				.on('error', (response) => {
					du.error('Create Domain Error');
					throw eu.getError('server', response);
				})
				.send();

		});

	}

	indexDocuments(domain_name) {

		du.debug('Index Documents');

		if (_.isUndefined(domain_name)) {
			domain_name = this.domainname;
		}

		return new Promise((resolve, reject) => {

			const parameters = {
				DomainName: domain_name,
			};

			this.cs.indexDocuments(parameters, (error, data) => {

				if (error) {

					du.error(error);

					return reject(error);

				}

				return resolve(data);

			});

		});

	}

	getDomainNames() {

		du.debug('Get Domain Names');

		return new Promise((resolve, reject) => {

			this.cs.listDomainNames((error, data) => {

				if (error) {
					return reject(error);
				}

				let domain_names = Object.keys(data.DomainNames || {});

				return resolve(domain_names);

			});

		});

	}

	deleteDomain(domain_name) {

		du.debug('Delete Domain');

		if (_.isUndefined(domain_name)) {
			domain_name = this.domainname;
		}

		return new Promise((resolve, reject) => {

			let parameters = {
				DomainName: domain_name
			};

			this.cs.deleteDomain(parameters, (error, data) => {

				if (error) {
					return reject(error);
				}

				return resolve(data);

			});

		});

	}

	//Technical Debt:  This totally doesn't belong here.  This is domain logic.
	saveDomainConfiguration() {

		du.debug('Save Domain Configuration');

		if (process.env.TEST_MODE === 'true') {
			du.debug('Test Mode');
			return Promise.resolve();
		}

		return this.describeDomains([this.domainname]).then((results) => {

			if (objectutilities.hasRecursive(results, 'DomainStatusList.0.DocService.Endpoint')) {

				let domain_endpoint = results.DomainStatusList[0].DocService.Endpoint;

				if (!_.isNull(domain_endpoint) && stringutilities.isMatch(domain_endpoint, /^[a-zA-Z0-9.\-:]+$/)) {

					//global.SixCRM.configuration.setEnvironmentConfig('cloudsearch.domainendpoint', domain_endpoint);

					return domain_endpoint;

				} else {

					throw eu.getError('server', 'Attempting to set a null or non-compliant cloudshift.domainendpoint configuration globally.');

				}

			} else {

				throw eu.getError('server', 'Attempting to set a null cloudshift.domainendpoint configuration globally.');

			}


		});

	}

	test() {

		du.debug('Test');

		let parameters = {
			query: 'A'
		};
		return this.search(parameters).then(result => {
			if (_.has(result, 'status')) {
				return {
					status: 'OK',
					message: 'Successfully connected to Cloudsearch.'
				};
			}
			return {
				status: 'ERROR',
				message: 'Unexpected response: ' + JSON.stringify(result)
			};
		}).catch(error => {
			return {
				status: 'ERROR',
				message: error.message
			};
		});
	}

}
