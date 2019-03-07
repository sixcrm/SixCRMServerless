const du = require('@6crm/sixcrmcore/lib/util/debug-utilities').default;
const eu = require('@6crm/sixcrmcore/lib/util/error-utilities').default;
const objectutilities = require('@6crm/sixcrmcore/lib/util/object-utilities').default;
const HTTPProvider = require('@6crm/sixcrmcore/lib/providers/http-provider').default;
const timestamp = require('@6crm/sixcrmcore/lib/util/timestamp').default
const numberutilities = require('@6crm/sixcrmcore/lib/util/number-utilities').default

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
		let parameters = objectutilities.transcribe(
			{
				DomainName: 'DomainName'
			},
			domain_definition,
			{},
			true
		);

		return this.elasticsearch.describeElasticsearchDomain(parameters).promise();

	}

	createDomain(domain_definition) {
		let parameters = domain_definition;

		return this.elasticsearch.createElasticsearchDomain(parameters).promise();

	}

	updateDomain(domain_definition) {
		let parameters = domain_definition;

		return this.elasticsearch.updateElasticsearchDomainConfig(parameters).promise();

	}

	waitFor(domain_definition, waitfor_status = 'ready', count = 0) {
		if (count > this.max_attempts) {

			if (process.env.TEST_MODE === 'true') {
				return Promise.resolve(true);
			}

			throw eu.getError('server', 'Max attempts reached.');

		}

		return this.describeDomain(domain_definition).then((result) => {

			// DomainStatus can be Created = true and Processing = false, but that's a lie, it's still not done yet.
			// We need an endpoint so we can deploy indices and mappings.
			if (result.DomainStatus.Created == true && result.DomainStatus.Processing == false && result.DomainStatus.Endpoint !== null) {
				return true;
			}

			count = count + 1;

			du.info('Pausing for completion (' + numberutilities.appendOrdinalSuffix(count) + ' attempt...)');

			return timestamp.delay(8000)().then(() => {
				return this.waitFor(domain_definition, waitfor_status, count);
			});

		});

	}

	test() {
		let httpprovider = new HTTPProvider();

		return httpprovider.getJSON({
			endpoint: 'https://' + global.SixCRM.configuration.site_config.elasticsearch.endpoint
		}).then(results => {
			if (results.response.statusCode === 200) {
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
