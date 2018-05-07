const _ = require('lodash');
const BBPromise = require('bluebird');
const elasticsearch = require('elasticsearch');
const du = global.SixCRM.routes.include('lib', 'debug-utilities.js');
const eu = global.SixCRM.routes.include('lib', 'error-utilities.js');
const objectutilities = global.SixCRM.routes.include('lib', 'object-utilities.js');
const arrayutilities = global.SixCRM.routes.include('lib', 'array-utilities.js');
const parserutilities = global.SixCRM.routes.include('lib', 'parser-utilities.js');
const ElasticSearchProvider = global.SixCRM.routes.include('controllers', 'providers/elasticsearch-provider.js');
const AWSDeploymentUtilities = global.SixCRM.routes.include('deployment', 'utilities/aws-deployment-utilities.js');

module.exports = class ElasticSearchDeployment extends AWSDeploymentUtilities {

	constructor() {

		super();

		this.esprovider = new ElasticSearchProvider();

	}

	deployDomains() {

		du.debug('Deploy Domains');

		const domains = this.getConfigurationJSON('domains');

		let domain_promises = arrayutilities.map(domains, (domain_definition) => {

			return () => this.deployDomain(domain_definition);

		});

		return arrayutilities.serial(domain_promises).then(() => {
			return 'Complete';
		});

	}

	deployDomain(domain_definition) {

		du.debug('Deploy Domain');

		return this.domainExists(domain_definition).then(result => {

			if (_.isNull(result)) {
				du.info('Creating domain: '+domain_definition.DomainName);
				return this.createDomain(domain_definition);
			}

			du.info('Domain Exists: '+domain_definition.DomainName);
			return this.esprovider.waitFor(domain_definition, 'ready');

		});

	}

	domainExists(domain_definition) {

		du.debug('Domain Exists');

		return this.esprovider.describeDomain(domain_definition).then(result => {

			if (_.has(result, 'DomainStatus') && _.has(result.DomainStatus, 'DomainId')) {
				return result;
			}

			return null;

		}).catch(error => {

			if (error.code == 'ResourceNotFoundException') {
				return null;
			}

			throw eu.getError('server', error);

		});

	}

	createDomain(domain_definition) {

		du.debug('Create Domain');

		let parameters = objectutilities.clone(domain_definition);

		this.handleAccessPolicies(parameters);

		return this.esprovider.createDomain(parameters).then(result => {

			du.info('Domain created: ' + domain_definition.DomainName);
			return result;

		})
			.then(() => this.esprovider.waitFor(domain_definition, 'ready'));

	}

	updateDomain(domain_definition) {

		du.debug('Update Domain');

		let parameters = objectutilities.clone(domain_definition);

		this.handleAccessPolicies(parameters);

		return this.esprovider.updateDomain(parameters).then(result => {

			du.info('Domain updated: ' + domain_definition.DomainName);
			return result;

		})
			.then(() => this.esprovider.waitFor(domain_definition, 'ready'))

	}

	handleAccessPolicies(parameters) {

		du.debug('Handle Access Policies');

		parameters.AccessPolicies = JSON.stringify(parameters.AccessPolicies);
		parameters.AccessPolicies = parserutilities.parse(parameters.AccessPolicies, {
			aws_account_id: global.SixCRM.configuration.site_config.aws.account,
			aws_account_region: global.SixCRM.configuration.site_config.aws.region,
			domain_name: parameters.DomainName
		});

	}

	async deployIndices() {

		du.debug('Deploy Indices');

		const configuration = this.getConfigurationJSON('indices');
		await BBPromise.mapSeries(configuration.domains, this.deployIndicesForDomain.bind(this));

		return 'Complete';

	}

	async deployIndicesForDomain(domain) {

		const domainDescription = await this.esprovider.describeDomain(domain);
		const esClient = new elasticsearch.Client({ host: domainDescription.DomainStatus.Endpoint });

		return BBPromise.mapSeries(domain.indices, (index) => this.deployIndex(index, esClient));

	}

	async deployIndex(index, esClient) {

		du.debug('Deploying Index', index);

		if (await esClient.indices.exists({ index: index.index })) {

			return du.debug('Index ' + index.index + ' exists');

		}

		return esClient.indices.create(index);

	}

	getConfigurationJSON(filename) {

		du.debug('Get Configuration JSON');

		return global.SixCRM.routes.include('deployment', 'elasticsearch/configuration/' + filename + '.json');

	}

}
