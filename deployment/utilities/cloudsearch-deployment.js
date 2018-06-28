
const _ = require('lodash');
const BBPromise = require('bluebird');

const du = require('@6crm/sixcrmcore/util/debug-utilities').default;
const eu = require('@6crm/sixcrmcore/util/error-utilities').default;
const fileutilities = require('@6crm/sixcrmcore/util/file-utilities').default;
const arrayutilities = require('@6crm/sixcrmcore/util/array-utilities').default;
const CloudsearchProvider = global.SixCRM.routes.include('controllers', 'providers/cloudsearch-provider.js');
const AWSDeploymentUtilities = global.SixCRM.routes.include('deployment', 'utilities/aws-deployment-utilities.js');

module.exports = class CloudsearchDeployment extends AWSDeploymentUtilities {

	constructor(instantiate_csd = true) {

		super();

		this.cloudsearchprovider = new CloudsearchProvider(instantiate_csd);

	}

	async deployDomains(){

		du.debug('Deploy Domains');

		const domains = this.getConfigurationJSON('domains');

		return BBPromise.each(domains, (domain) => {
			return this.deployDomain(domain);
		}).then(() => {
			return 'Complete';
		});

	}

	async deployDomain(domain_definition){

		du.debug('Deploy Domain');

		let result = await this.domainExists(domain_definition);

		if(_.isNull(result)){

			du.info('Creating Domain: ', domain_definition);
			return this.createCloudsearchDomain(domain_definition);

		}

		du.info('Domain Exists: ', domain_definition);
		//Technical Debt:  Need a update function
		return true;

	}

	async domainExists(domain_definition){

		du.debug('Cloudsearch Domain Exists');

		let results = await this.cloudsearchprovider.describeDomains([domain_definition.DomainName]);

		if(_.has(results, 'DomainStatusList') && _.isArray(results.DomainStatusList)){

			if(arrayutilities.nonEmpty(results.DomainStatusList)){
				if(results.DomainStatusList.length == 1){
					return results.DomainStatusList[0];
				}
				throw eu.getError('server', 'Multiple results returned: ', results);
			}
			return null;
		}

		throw eu.getError('server', 'Unexpected result: ', results);

	}

	async createCloudsearchDomain(domain_definition) {

		du.debug('Create Cloudsearch Domain');

		await this.cloudsearchprovider.createDomain(domain_definition.DomainName);

		return this.cloudsearchprovider.waitFor('ready', domain_definition);

	}

	deployIndexes(){

		du.debug('Deploy Indexes');
		return this.createCloudsearchIndexes()
			.then(() => this.indexCloudsearchDocuments())
			.then(() => { return 'Complete'; });

	}

	//Note:  This is a "do everything" method.  Avoid where possible.
	deploy(){

		du.debug('Deploy');

		return this.createCloudsearchDomain()
			.then(() => this.createCloudsearchIndexes())
			.then(() => this.indexCloudsearchDocuments())
			.then(() => { return 'Complete'; });

	}

	destroy(){

		return this.deleteCloudsearchDomain()
			.then(() => { return 'Complete'; });

	}

	purge(){

		//Deprectated, must provide domain name
		return this.cloudsearchDomainExists().then((result) => {
			if(_.isObject(result)){
				return this.getCloudsearchPurgeDocument()
					.then((purge_document) => this.purgeCloudsearchDocuments(purge_document))
					.then(() => {
						return 'Complete';
					});
			}else{
				return 'Complete';
			}
		});
	}

	getCloudsearchPurgeDocument(){

		let query_parameters = {
			queryParser: 'structured',
			query: 'matchall',
			size: '10000'
		};

		return this.cloudsearchprovider.search(query_parameters).then((results) => {

			du.warning(results);

			let documents = [];

			if(_.has(results, 'hits')){

				if(_.has(results.hits, 'found')){

					du.info('Removing '+results.hits.found+' documents');

				}else{

					throw eu.getError('server','Unable to identify found count in search results.');

				}

				if(_.has(results.hits, 'hit') && _.isArray(results.hits.hit)){

					results.hits.hit.forEach((hit) => {

						documents.push('{"type": "delete", "id": "'+hit.id+'"}');

					});

				}else{

					throw eu.getError('server','Unable to identify hit property in search results hits.');

				}

			}else{

				throw eu.getError('server','Unable to identify hits property in search results.');

			}

			if(documents.length > 0){

				return '['+arrayutilities.compress(documents, ',', '')+']';

			}else{

				return false;

			}

		});

	}

	purgeCloudsearchDocuments(purge_document){

		du.debug('Purge Cloudsearch Documents');

		if(purge_document == false){

			du.info('No documents to purge.');

			return Promise.resolve(null);

		}else{

			return this.cloudsearchprovider.uploadDocuments(purge_document).then((response) => {

				du.info('Purge Response: ', response);

				return response;

			});

		}

	}

	createCloudsearchIndexes() {

		du.debug('Create Cloudsearch Indexes');

		let index_objects = this.getIndexConfigurations();

		let index_promises = arrayutilities.map(index_objects, (index_object) => {
			return () => this.createCloudsearchIndex(index_object).then(async () => {
				await new Promise(resolve => {
					du.info('Pausing 5s...');
					return setTimeout(resolve, 5000);
				});
				return true;
			});
		});

		return arrayutilities.serial(index_promises);

	}

	getIndexConfigurations(){

		du.debug('Get Index Objects');

		let files = fileutilities.getDirectoryFilesSync(global.SixCRM.routes.path('deployment','cloudsearch/configuration/indexes'));

		let index_objects = arrayutilities.map(files, (file) => {

			let index_object = global.SixCRM.routes.include('deployment','cloudsearch/configuration/indexes/'+file);

			index_object.DomainName = global.SixCRM.configuration.site_config.cloudsearch.domainname;

			return index_object;

		});

		return index_objects;

	}

	createCloudsearchIndex(index_object) {

		du.debug('Create Cloudsearch Index');

		return this.cloudsearchprovider.defineIndexField(index_object);

	}

	indexCloudsearchDocuments(domainname) {

		du.debug('Index Cloudsearch Documents');

		return this.cloudsearchprovider.indexDocuments(domainname);

	}

	deleteCloudsearchDomain(domainname){

		du.debug('Delete Cloudsearch Domain');

		return this.cloudsearchDomainExists(domainname).then((result) => {

			if(_.isObject(result)){

				return this.cloudsearchprovider.deleteDomain(domainname).then(() => {
					return this.cloudsearchprovider.waitFor('deleted');
				});

			}

			return false;

		});

	}

	getConfigurationJSON(filename) {

		du.debug('Get Configuration JSON');

		//Technical Debt:  This needs to be expanded to support multiple definitions...
		return global.SixCRM.routes.include('deployment', 'cloudsearch/configuration/' + filename + '.json');

	}

}
