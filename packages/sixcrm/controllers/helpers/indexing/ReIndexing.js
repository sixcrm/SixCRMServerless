const _ = require('lodash');
const du = require('@6crm/sixcrmcore/lib/util/debug-utilities').default;
const arrayutilities = require('@6crm/sixcrmcore/lib/util/array-utilities').default;
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
	async execute(fix = false){
		if(fix == true){
			du.warning('Fix: On');
		}

		await this.getCloudsearchItemsRecursive();
		await this.getDynamoItems();
		this.determineDifferences();
		this.printStatistics();
		await this.fixIndex(fix);
		return du.info('Finished');
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

		const limit = 100000;
		let promises = [];

		let indexing_entities = global.SixCRM.routes.include('model', 'helpers/indexing/entitytype.json').enum;

		du.info('Indexing entities: ' + indexing_entities);

		indexing_entities.map(entity => {
			promises.push(async () => {
				du.info(`Scanning ${entity}s...`);
				const result = await dynamodbprovider.scanRecords(entity + 's', {limit});
				return result.Items.map(c => {
					entities_dynamodb.push({
						id: c.id,
						entity_type: entity,
						entity: c
					});
				});
			});
		});

		return arrayutilities.serial(promises);
	}

	determineDifferences() {
		du.info('Calculating differences...');

		const entitiesIndexById = _.keyBy(entities_index, 'id');
		const entitiesDynamoById = _.keyBy(entities_dynamodb, 'id');

		for (const { id, entity, entity_type} of entities_dynamodb) {
			if (!entitiesIndexById[id]) {
				let add = Object.assign({}, entity);

				add.entity_type = entity_type;
				missing_in_index.push(add);

				if (!index_details[add.entity_type]) {
					index_details[add.entity_type] = 0;
				}

				index_details[add.entity_type]++;
			}
		}

		for (const { id, fields } of entities_index.filter(i => i.fields.entity_type)) {
			if (!entitiesDynamoById[id]) {
				missing_in_dynamo.push({ id, entity_type: fields.entity_type[0], fields });

				if (!db_details[fields.entity_type]) {
					db_details[fields.entity_type] = 0;
				}

				db_details[fields.entity_type]++;
			}
		}
	}

	printStatistics() {

		const printDynamoTypeStatistics = () => {
			const types = entities_dynamodb.map(e => e.entity_type);
			const typeMap = types.reduce(
				(results, t) => {
					results.has(t) ? results.set(t, results.get(t) + 1) : results.set(t, 1);
					return results;
				},
				new Map()
			);
			typeMap.forEach((value, key) => {
				du.info(`Total ${key}s in dynamodb: ${value}`);
			});
		};

		const reduceIndexTypes = () => {
			const types = entities_index.map(e => e.fields.entity_type && e.fields.entity_type[0]);
			return types.reduce(
				(results, t) => {
					results.has(t) ? results.set(t, results.get(t) + 1) : results.set(t, 1);
					return results;
				},
				new Map()
			);
		};

		const printIndexTypeStatistics = () => {
			const numTypes = reduceIndexTypes();
			numTypes.forEach((value, key) => {
				if (key) {
					du.info(`Total ${key}s in index: ${value}`);
				} else {
					du.info(`Total missing entity type in index: ${value}`);
				}
			});
		};

		du.info('Total in dynamodb: ' + entities_dynamodb.length);
		printDynamoTypeStatistics();
		du.info('Total in index: ' + entities_index.length);
		printIndexTypeStatistics();
		du.info('Missing in index: ' + missing_in_index.length);
		du.debug(index_details);
		du.info('Missing in dynamodb: ' + missing_in_dynamo.length);
		du.debug(db_details);
		for (let document of missing_in_dynamo) {
			du.debug(document);
		}
	}

	async fixIndex(fix) {

		if (fix === true) {

			let uploadGroups = [];
			const uploadLimit = 1000;

			if (missing_in_index.length) {
				uploadGroups = uploadGroups.concat(
					_.chunk(
						missing_in_index.map(entity => ({ index_action: 'add', ...entity })),
						uploadLimit
					)
				);
			}

			if (missing_in_dynamo.length) {
				uploadGroups = uploadGroups.concat(
					_.chunk(
						missing_in_dynamo.map(entity => ({ index_action: 'delete', ...entity })),
						uploadLimit
					)
				);
			}

			if (uploadGroups.length) {
				du.info('Repairing cloudsearch index...');

				for (const group of uploadGroups) {
					const document = await indexingHelperController.createIndexingDocument(group);
					du.info(`Repairing ${group.length} documents...`);
					try {
						await cloudsearchprovider.uploadDocuments(document);
					} catch (err) {
						du.error('Error uploading document:', err);
					}
				}
			}
		}
	}

};
