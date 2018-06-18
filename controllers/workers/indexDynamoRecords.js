const _ = require('lodash');
const du = require('@sixcrm/sixcrmcore/util/debug-utilities').default;
const eu = require('@sixcrm/sixcrmcore/util/error-utilities').default;
const arrayutilities = require('@sixcrm/sixcrmcore/util/array-utilities').default;
const objectutilities = require('@sixcrm/sixcrmcore/util/object-utilities').default;
const CloudsearchProvider = global.SixCRM.routes.include('controllers', 'providers/cloudsearch-provider.js');
const DynamoDBProvider = global.SixCRM.routes.include('controllers', 'providers/dynamodb-provider.js');
const IndexingHelperController = global.SixCRM.routes.include('helpers', 'indexing/Indexing.js');

var workerController = global.SixCRM.routes.include('controllers', 'workers/sqs/worker.js');

module.exports = class IndexDynamoRecordsController extends workerController {

	constructor(){

		super();

		this.dynamodbprovider = new DynamoDBProvider();
		this.dynamodbprovider.instantiateDynamo();

		this.setAbridgedEntityMap();

	}

	async execute(event){

		du.debug('Execute');

		if(_.has(event, 'Records') && _.isArray(event.Records) && arrayutilities.nonEmpty(event.Records)){

			await this.indexRecords(event.Records);

		}

		return Promise.resolve(true);

	}

	async indexRecords(records){

		du.debug('Index Records');

		let indexing_document = await this.createIndexingDocument(records);

		let result = await this.pushIndexingDocumentToCloudSearch(indexing_document);

		du.info(result);

		return true;

	}

	createIndexingDocument(records){

		du.debug('Create Indexing Document');

		records = this.convertRecords(records);

		return new IndexingHelperController().createIndexingDocument(records);

	}

	convertRecords(records){

		du.debug('Convert Records');

		return arrayutilities.map(records, record => {
			let action_type = this.getIndexingAction(record);
			let entity_type = this.getEntityType(record);
			let unmarshalled_record = this.convertDynamoJSON(record);
			unmarshalled_record.index_action = action_type;
			unmarshalled_record.entity_type = entity_type;
			unmarshalled_record = this.abridgeEntity(unmarshalled_record);
			return unmarshalled_record;
		});

	}

	pushIndexingDocumentToCloudSearch(indexing_document){

		du.debug('Push Indexing Document To CloudSearch');

		return new CloudsearchProvider().uploadDocuments(indexing_document);

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

	abridgeEntity(entity){

		du.debug('Abridge Entity');

		entity = objectutilities.transcribe(this.abridged_entity_map, entity, {});

		return entity;

	}

	convertDynamoJSON(record){

		du.debug('Convert Dynamo JSON');

		if(_.has(record.dynamodb, 'NewImage')){
			return this.dynamodbprovider.unmarshall(record.dynamodb.NewImage);
		}else if(_.has(record.dynamodb, 'OldImage')){
			return this.dynamodbprovider.unmarshall(record.dynamodb.OldImage);
		}


	}

	getIndexingAction(record, fatal = false){

		du.debug('Get Indexing Action');

		if(!_.has(record, 'eventName')){

			if(fatal){
				throw eu.getError('server', 'Expected record to have property "eventName".');
			}

			du.warning('Expected record to have property "eventName".');
			return null;

		}

		if(!_.includes(['INSERT','UPDATE','REMOVE'], record.eventName)){

			if(fatal){
				throw eu.getError('server', 'Unknown record eventName: '+record.eventName);
			}

			du.warning('Unknown record eventName: '+record.eventName);
			return null;

		}

		if(_.includes(['INSERT','UPDATE'], record.eventName)){
			return 'add';
		}

		return 'delete';

	}

	getEntityType(record){

		du.debug('Get Entity Type');
		du.debug(record);

		return 'customer';

	}

}
