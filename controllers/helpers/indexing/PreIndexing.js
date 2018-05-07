
const _ =  require('lodash');

const du = global.SixCRM.routes.include('lib', 'debug-utilities.js');
const eu = global.SixCRM.routes.include('lib', 'error-utilities.js');
const objectutilities = global.SixCRM.routes.include('lib', 'object-utilities.js');
const SQSProvider = global.SixCRM.routes.include('controllers', 'providers/sqs-provider.js');

module.exports = class PreIndexingHelperController {

	constructor(){

		this.parameter_definitions = {
			required:{
				transaction: 'transaction'
			},
			optional:{
				amount: 'amount'
			}
		};

		this.parameter_validation = {
			'preindexingentity': global.SixCRM.routes.path('model','helpers/indexing/preindexingentity.json'),
			'abridgedentity': global.SixCRM.routes.path('model','helpers/indexing/indexelement.json'),
			'packagedabridgedentity': global.SixCRM.routes.path('model','helpers/indexing/packagedabridgedentity.json')
		};

		this.initialize();

	}

	initialize(){

		const Parameters = global.SixCRM.routes.include('providers', 'Parameters.js');

		this.parameters = new Parameters({validation: this.parameter_validation, definition: this.parameter_definitions});

		this.sqsprovider = new SQSProvider();

		this.setIndexingEntities();
		this.setAbridgedEntityMap();

		return true;

	}

	setIndexingEntities(){

		du.debug('Set Indexing Entities');

		this.indexing_entities = global.SixCRM.routes.include('model', 'helpers/indexing/entitytype.json').enum;

		return true;

	}

	setAbridgedEntityMap(){

		du.debug('Set Abridged Entity Map');

		let index_element_fields = global.SixCRM.routes.include('model','helpers/indexing/indexelement.json').properties;

		if(!_.has(this, 'abridged_entity_map')){
			this.abridged_entity_map = {};
		}

		objectutilities.map(index_element_fields, key => {
			this.abridged_entity_map[key] = key;
		});

		return true;

	}

	//Entrypoint
	removeFromSearchIndex(entity){

		du.debug('Remove From Search Index');

		entity.index_action = 'delete';

		this.parameters.set('preindexingentity', entity);

		return this.executePreIndexing();

	}

	//Entrypoint
	addToSearchIndex(entity){

		du.debug('Add To Search Index')

		entity.index_action = 'add';

		this.parameters.set('preindexingentity', entity);

		return this.executePreIndexing();

	}

	executePreIndexing(){

		du.debug('execute');

		return this.validateEntityForIndexing()
			.then(() => {
				return this.abridgeEntity()
					.then(() => this.packageEntity())
					.then(() => this.pushToIndexingBucket());
			})
			.catch((result) => {
				if(result == true){
					return Promise.resolve(true);
				}
				throw eu.getError(result);
			});

	}

	validateEntityForIndexing(){

		let preindexing_entity = this.parameters.get('preindexingentity');

		if(!_.includes(this.indexing_entities, preindexing_entity.entity_type)){
			du.info('Not a indexed entity type: '+preindexing_entity.entity_type);
			return Promise.reject(true);
		}

		return Promise.resolve(true);

	}

	abridgeEntity(){

		du.debug('Abridge Entity');

		let preindexing_entity = this.parameters.get('preindexingentity');

		let abridged_entity = objectutilities.transcribe(this.abridged_entity_map, preindexing_entity, {});

		this.parameters.set('abridgedentity', abridged_entity);

		return Promise.resolve(true);

	}

	packageEntity(){

		du.debug('Package Entity');

		let abridged_entity = this.parameters.get('abridgedentity');

		let packaged_abridged_entity = JSON.stringify(abridged_entity);

		this.parameters.set('packagedabridgedentity', packaged_abridged_entity);

		return Promise.resolve(true);

	}

	pushToIndexingBucket(){

		du.debug('Push To Indexing Bucket');

		let packaged_abridged_entity = this.parameters.get('packagedabridgedentity');

		//Technical Debt:  Queue name should be configured...
		return this.sqsprovider.sendMessage({message_body: packaged_abridged_entity, queue: 'search_indexing'}).then(() => {

			du.debug('Message sent to the queue.');

			return true;

		});

	}

}
