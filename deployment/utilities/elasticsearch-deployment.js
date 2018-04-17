const _ = require('lodash');
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
				return this.createDomain(domain_definition);
			}
			return this.updateDomain(domain_definition);
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

			du.highlight('Domain created: ' + domain_definition.DomainName);
			return result;

		});

	}

	updateDomain(domain_definition) {

		du.debug('Update Domain');

		let parameters = objectutilities.clone(domain_definition);

		this.handleAccessPolicies(parameters);

		return this.esprovider.updateDomain(parameters).then(result => {

			du.highlight('Domain updated: ' + domain_definition.DomainName);
			return result;

		});

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


	getConfigurationJSON(filename) {

		du.debug('Get Configuration JSON');

		return global.SixCRM.routes.include('deployment', 'elasticsearch/configuration/' + filename + '.json');

	}

}
