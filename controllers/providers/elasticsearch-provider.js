const _ = require('lodash');
const du = global.SixCRM.routes.include('lib', 'debug-utilities.js');
const eu = global.SixCRM.routes.include('lib', 'error-utilities.js');
const objectutilities = global.SixCRM.routes.include('lib', 'object-utilities.js');
const HTTPProvider = global.SixCRM.routes.include('providers', 'http-provider.js');
const timestamp = global.SixCRM.routes.include('lib', 'timestamp.js')
const numberutilities = global.SixCRM.routes.include('lib', 'number-utilities.js')

const AWSProvider = global.SixCRM.routes.include('controllers', 'providers/aws-provider.js');

module.exports = class ElasticSearchProvider extends AWSProvider {

	constructor() {

		super();

		this.instantiateAWS();

		this.elasticsearch = new this.AWS.ES({
			apiVersion: '2015-01-01',
			region: global.SixCRM.configuration.site_config.aws.region
		});

		this.max_attempts = 400;

	}

	describeDomain(domain_definition) {

		du.debug('Describe Domain');

		let parameters = objectutilities.transcribe(
			{
				DomainName: 'DomainName'
			},
			domain_definition,
			{},
			true
		);

		return new Promise((resolve) => {

			this.elasticsearch.describeElasticsearchDomain(parameters, (error, data) => {

				resolve(this.tolerantCallback(error, data, false));

			});

		});

	}

	createDomain(domain_definition) {

		du.debug('Create Domain');

		let parameters = domain_definition;

		return new Promise((resolve) => {

			this.elasticsearch.createElasticsearchDomain(parameters, (error, data) => {

				resolve(this.AWSCallback(error, data));

			});

		});

	}

	updateDomain(domain_definition) {

		du.debug('Update Domain');

		let parameters = domain_definition;

		return new Promise((resolve) => {

			this.elasticsearch.updateElasticsearchDomainConfig(parameters, (error, data) => {

				resolve(this.AWSCallback(error, data));

			});

		});

	}

	waitFor(domain_definition, waitfor_status = 'ready', count = 0) {

		du.debug('Wait For');

		if (count > this.max_attempts) {

			if (process.env.TEST_MODE === 'true') {
				du.debug('Test Mode');
				return Promise.resolve(true);
			}

			throw eu.getError('server', 'Max attempts reached.');

		}

		return this.describeDomain(domain_definition).then((result) => {

			if (result.DomainStatus.Created == true && result.DomainStatus.Processing == false) {
				return true;
			}

			count = count + 1;

			du.output('Pausing for completion (' + numberutilities.appendOrdinalSuffix(count) + ' attempt...)');

			return timestamp.delay(8000)().then(() => {
				return this.waitFor(domain_definition, waitfor_status, count);
			});

		});

	}

	test() {

		du.debug('Test');

		let httpprovider = new HTTPProvider();

		return httpprovider.getJSON({
			endpoint: 'https://' + process.env.elasticsearch_endpoint
		}).then(results => {
			if (_.has(results, 'body') && _.has(results.body, 'status') && results.body.status == 200) {
				return {
					status: 'OK',
					message: 'Successfully connected.'
				};
			}
			return {
				status: 'Error',
				message: 'Unexpected response from Elasticsearch: ' + JSON.stringify(results)
			};
		}).catch(error => {
			return Promise.resolve({
				status: 'Error',
				message: error.message
			});
		});

	}

}
