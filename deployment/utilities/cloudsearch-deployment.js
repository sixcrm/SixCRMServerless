
const _ = require('lodash');
const du = global.SixCRM.routes.include('lib', 'debug-utilities.js');
const eu = global.SixCRM.routes.include('lib', 'error-utilities.js');
const fileutilities = global.SixCRM.routes.include('lib', 'file-utilities.js');
const arrayutilities = global.SixCRM.routes.include('lib', 'array-utilities.js');
const CloudsearchProvider = global.SixCRM.routes.include('controllers', 'providers/cloudsearch-provider.js');
const AWSDeploymentUtilities = global.SixCRM.routes.include('deployment', 'utilities/aws-deployment-utilities.js');

module.exports = class CloudsearchDeployment extends AWSDeploymentUtilities {

	constructor(instantiate_csd = true) {

		super();

		this.cloudsearchprovider = new CloudsearchProvider(instantiate_csd);

	}

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

					du.highlight('Removing '+results.hits.found+' documents');

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

			du.highlight('No documents to purge.');

			return Promise.resolve(null);

		}else{

			return this.cloudsearchprovider.uploadDocuments(purge_document).then((response) => {

				du.highlight('Purge Response: ', response);

				return response;

			});

		}

	}

	domainExists(domain_definition){

		du.debug('Domain Exists');

		//Technical Debt:  Due to old provider code...
		let parameters = [domain_definition.DomainName];

		return this.cloudsearchprovider.describeDomains(parameters).then(result => {

			if(_.has(result, 'DomainStatusList') && _.isArray(result.DomainStatusList)){
				if(arrayutilities.nonEmpty(result.DomainStatusList)){
					if(result.DomainStatusList.length == 1){
						return result.DomainStatusList[0];
					}
					throw eu.getError('server', 'Multiple results returned: ', result);
				}
				return null;
			}
			throw eu.getError('server', 'Unexpected result: ', result);
		});

	}

	createCloudsearchDomain() {

		du.debug('Create Cloudsearch Domain');

		return this.cloudsearchDomainExists().then((result) => {

			if(result == false){

				return this.cloudsearchprovider.createDomain()
					.then(() => this.cloudsearchprovider.waitFor('ready'));

			}else{

				if(_.has(result, 'Processing')){

					if(result.Processing == true){
						du.highlight('Domain is processing...');
						return this.cloudsearchprovider.waitFor('ready');
					}else{
						return result;
					}

				}
			}
			return false;

		});

	}

	createCloudsearchIndexes() {

		du.debug('Create Cloudsearch Indexes');

		let index_objects = this.getIndexConfigurations();

		let index_promises = index_objects.map((index_object) => { return () => this.createCloudsearchIndex(index_object); });

		return arrayutilities.reduce(
			index_promises,
			(current, next) => {
				if(_.isUndefined(current)){
					return next;
				}
				return current.then(next);
			},
			Promise.resolve()
		);

		/*
      return index_promises.reduce(function(current, next) {
          if(_.isUndefined(current)){
            return next;
          }
          return current.then(next);
      }, Promise.resolve());
      */

	}

	getIndexConfigurations(){

		du.debug('Get Index Objects');

		let files = fileutilities.getDirectoryFilesSync(global.SixCRM.routes.path('deployment','cloudsearch/indexes'));

		let index_objects = arrayutilities.map(files, (file) => {

			let index_object = global.SixCRM.routes.include('deployment','cloudsearch/indexes/'+file);

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

	cloudsearchDomainExists(domainname){

		du.debug('Cloudsearch Domain Exists');

		if(_.isUndefined(domainname)){
			domainname = global.SixCRM.configuration.site_config.cloudsearch.domainname;
		}

		return this.cloudsearchprovider.describeDomains([domainname]).then((results) => {

			if(_.has(results, 'DomainStatusList') && _.isArray(results.DomainStatusList) && results.DomainStatusList.length > 0){

				let found = arrayutilities.find(results.DomainStatusList, (domain) => {

					if(domain.DomainName == domainname){
						return true;
					}
					return false;

				});

				if(_.isObject(found)){

					du.highlight('Domain exists');
					return found;

				}

			}

			du.highlight('Domain not found');
			return false;


		});

	}

}
