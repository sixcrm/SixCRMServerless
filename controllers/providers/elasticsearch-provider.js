const _ = require('lodash');
const du = global.SixCRM.routes.include('lib', 'debug-utilities.js');
const objectutilities = global.SixCRM.routes.include('lib','object-utilities.js');
const HTTPProvider = global.SixCRM.routes.include('providers','http-provider.js');

const AWSProvider = global.SixCRM.routes.include('controllers', 'providers/aws-provider.js');

module.exports = class ElasticSearchProvider extends AWSProvider{

	constructor(){

		super();

		this.instantiateAWS();

		this.elasticsearch = new this.AWS.ES({apiVersion: '2015-01-01'});

	}

	describeDomain(domain_definition){

		du.debug('Describe Domain');

		let parameters = objectutilities.transcribe(
			{
				DomainName:'DomainName'
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

	createDomain(domain_definition){

		du.debug('Create Domain');

		let parameters = domain_definition;

		return new Promise((resolve) => {

			this.elasticsearch.createElasticsearchDomain(parameters, (error, data) => {

				resolve(this.AWSCallback(error, data));

			});

		});

	}

	updateDomain(domain_definition){

		du.debug('Update Domain');

		let parameters = domain_definition;

		return new Promise((resolve) => {

			this.elasticsearch.updateElasticsearchDomainConfig(parameters, (error, data) => {

				resolve(this.AWSCallback(error, data));

			});

		});

	}

	test(){

		du.debug('Test');

		let httpprovider = new HTTPProvider();

		return httpprovider.getJSON({endpoint: 'https://'+process.env.elasticsearch_endpoint}).then(results => {
			if(_.has(results, 'body') && _.has(results.body, 'status') && results.body.status == 200){
				return {status: 'OK', message: 'Successfully connected.'};
			}
			return {status: 'Error', message: 'Unexpected response from Elasticsearch: '+JSON.stringify(results)};
		}).catch(error => {
			return Promise.resolve({status:'Error',message: error.message});
		});

	}

}
