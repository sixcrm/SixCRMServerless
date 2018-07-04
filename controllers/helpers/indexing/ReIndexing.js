const du = require('@6crm/sixcrmcore/util/debug-utilities').default;
const arrayutilities = require('@6crm/sixcrmcore/util/array-utilities').default;
const DynamoDBProvider = global.SixCRM.routes.include('controllers', 'providers/dynamodb-provider.js');
const dynamodbprovider = new DynamoDBProvider();
const CloudsearchProvider = global.SixCRM.routes.include('controllers', 'providers/cloudsearch-provider.js');
const cloudsearchprovider = new CloudsearchProvider();

const IndexingHelperController = global.SixCRM.routes.include('helpers', 'indexing/Indexing.js');
let indexingHelperController = new IndexingHelperController();

let entities_dynamodb = [];
let entities_index = [];

let missing_in_index = [];
let missing_in_dynamo = [];

let index_details = {};
let db_details = {};

module.exports = class ReIndexingHelperController {

	constructor(){

	}

	//Entrypoint
	execute(fix = false){

		du.debug('Reindexing');

		if(fix == true){
			du.warning('Fix: On');
		}

		return this.getCloudsearchItemsRecursive()
			.then(() => this.getDynamoItems())
			.then(() => this.determineDifferences())
			.then(() => this.printStatistics())
			.then(() => this.fixIndex(fix))
			.then(() => {
				return du.info('Finished');
			});
	}

	getCloudsearchItemsRecursive(cursor, all_items) {

		const limit = 10000;

		if (cursor === undefined) {
			cursor = 'initial';
		}

		if (all_items === undefined) {
			all_items = [];
		}

		let parameters = {
			query: 'matchall',
			queryParser: 'structured',
			size: limit,
			cursor: cursor
		};

		return cloudsearchprovider.executeStatedSearch(parameters).then((search_results) => {

			all_items.push(...search_results.hits.hit);

			if (search_results.hits.hit.length > 0) {
				return this.getCloudsearchItemsRecursive(search_results.hits.cursor, all_items);
			}

			return Promise.resolve(all_items).then(() => entities_index = all_items);
		})
	}

	getDynamoItems() {

		let promises = [];

		let indexing_entities = global.SixCRM.routes.include('model', 'helpers/indexing/entitytype.json').enum;

		du.info('Indexing entities: ' + indexing_entities);

		indexing_entities.map(entity => {
			promises.push(() => dynamodbprovider.scanRecords(entity + 's').then(r => {
				return r.Items.map(c => {
					entities_dynamodb.push({
						id: c.id,
						entity_type: entity,
						entity: c
					});
				});
			}));
		});

		return arrayutilities.serial(promises);
	}

	determineDifferences() {

		entities_dynamodb.map(d => {
			if (!(entities_index.map(i => i.id).includes(d.id))) {
				let add = Object.assign({}, d.entity);

				add.entity_type = d.entity_type;
				missing_in_index.push(add);

				if (!index_details[add.entity_type]) {
					index_details[add.entity_type] = 0;
				}

				index_details[add.entity_type]++;
			}
		});

		entities_index.map(i => {
			if (!(entities_dynamodb.map(d => d.id).includes(i.id))) {
				missing_in_dynamo.push({id: i.id, entity_type: i.fields.entity_type[0]});

				if (!db_details[i.fields.entity_type]) {
					db_details[i.fields.entity_type] = 0;
				}

				db_details[i.fields.entity_type]++;
			}
		});
	}

	printStatistics() {

		du.info('Total in dynamodb: ' + entities_dynamodb.length);
		du.info('Total in index: ' + entities_index.length);
		du.info('Missing in index: ' + missing_in_index.length);
		du.debug(index_details);
		du.info('Missing in dynamodb: ' + missing_in_dynamo.length);
		du.debug(db_details);

	}

	fixIndex(fix) {

		if (fix === true) {

			let promises = [];

			if (missing_in_index.length) {
				let adds = indexingHelperController.createIndexingDocument(missing_in_index.map(m => {
					m.index_action = 'add';
					return m;
				})).then(document => cloudsearchprovider.uploadDocuments(document));
				promises.push(adds);
			}

			if (missing_in_dynamo.length) {
				let deletes = indexingHelperController.createIndexingDocument(missing_in_dynamo.map(m => {
					m.index_action = 'delete';
					return m;
				})).then(document => cloudsearchprovider.uploadDocuments(document));
				promises.push(deletes);
			}

			return Promise.all(promises);

		}

		return true;

	}

};
