const _ = require('lodash');

const du = require('@6crm/sixcrmcore/util/debug-utilities').default;
const eu = require('@6crm/sixcrmcore/util/error-utilities').default;
const arrayutilities = require('@6crm/sixcrmcore/util/array-utilities').default;
const objectutilities = require('@6crm/sixcrmcore/util/object-utilities').default;
const stringutilities = require('@6crm/sixcrmcore/util/string-utilities').default;
const random = require('@6crm/sixcrmcore/util/random').default;
const timestamp = require('@6crm/sixcrmcore/util/timestamp').default;

const AWSProvider = global.SixCRM.routes.include('controllers', 'providers/aws-provider.js');

module.exports = class DynamoDBProvider extends AWSProvider{

	constructor(){

		super();

	}

	instantiateDynamo(){

		du.debug('Set Dynamo Objects');

		let dynamo_region = (objectutilities.hasRecursive(global.SixCRM.configuration.site_config, 'dynamodb.region'))?global.SixCRM.configuration.site_config.dynamodb.region:this.getRegion();

		let parameters = {
			region: dynamo_region
		}

		if(objectutilities.hasRecursive(global.SixCRM.configuration.site_config, 'dynamodb.endpoint')){
			parameters.endpoint = global.SixCRM.configuration.site_config.dynamodb.endpoint;
			// when we are local and do not have ~./aws/credentials, it requires params to be set even though they are totally pointless
			parameters.accessKeyId = 'X';
			parameters.secretAccessKey = 'X';
		}

		if(!_.has(this, 'AWS')){
			this.instantiateAWS();
		}

		this.dynamodb = new this.AWS.DynamoDB.DocumentClient(parameters);
		this.dynamoraw = new this.AWS.DynamoDB(parameters);

	}

	unmarshall(data, options){

		du.debug('Unmarshall');

		return this.AWS.DynamoDB.Converter.unmarshall(data, options);

	}

	get(table, key){

		du.debug('Get');

		let parameters = {
			TableName: table,
			Key: key
		};

		return this.executeDynamoDBMethod({method: 'get', parameters: parameters});

	}

	scanRecords(table, additional_parameters){

		du.debug('Scan Records');

		var parameters = {
			TableName: table
		};

		parameters = this.translateParameters(additional_parameters, parameters);

		return this.executeRecursiveScan({parameters});
	}

	queryRecords(table, additional_parameters, index){

		du.debug('Query Records');

		var parameters = {
			TableName: table,
			IndexName: index
		};

		parameters = this.translateParameters(additional_parameters, parameters);

		if(_.has(parameters, 'FilterExpression')){

			return this.executeRecursiveQuery({parameters: parameters});

		}

		return this.executeDynamoDBMethod({method: 'query', parameters: parameters});

	}

	executeRecursiveQuery({parameters, aggregated_results}){

		du.debug('Execute Recursive Query');

		if(!_.has(parameters, 'Limit')){
			parameters.Limit = 100;
		}

		let limit = parameters.Limit;

		if(_.isUndefined(aggregated_results)){
			aggregated_results = {
				Items:[],
				ScannedCount:0
			};
		}

		if(_.has(aggregated_results, 'LastEvaluatedKey')){

			parameters.ExclusiveStartKey = aggregated_results.LastEvaluatedKey;

		}

		return this.executeDynamoDBMethod({method: 'query', parameters: parameters}).then(result => {

			let result_index = 0;

			if(arrayutilities.nonEmpty(result.Items) > 0){

				//While we haven't met the limit and there are more results in the set.
				while(aggregated_results.Items.length < limit && result_index < result.Items.length){

					aggregated_results.Items.push(result.Items[result_index]);
					result_index++;

				}

			}

			aggregated_results.ScannedCount += result.ScannedCount;

			if(!_.has(result, 'LastEvaluatedKey')){
				if(_.has(aggregated_results, 'LastEvaluatedKey')){
					delete aggregated_results.LastEvaluatedKey;
				}
				aggregated_results.Count = aggregated_results.Items.length;

				return aggregated_results;
			}

			//there are more results
			if(aggregated_results.Items.length == limit){

				aggregated_results.ScannedCount += ((-1 * result.ScannedCount)+ result_index);
				aggregated_results.LastEvaluatedKey = this.determineLastEvaluatedKey(result, (result_index - 1));
				aggregated_results.Count = aggregated_results.Items.length;

				return aggregated_results;

			}else{

				aggregated_results.LastEvaluatedKey = result.LastEvaluatedKey;

			}

			return this.executeRecursiveQuery({parameters: parameters, aggregated_results: aggregated_results});

		});

	}

	executeRecursiveScan({parameters, aggregated_results}){

		du.debug('Execute Recursive Query');
		du.debug('parameters', parameters);

		if(!_.has(parameters, 'Limit')){
			parameters.Limit = 100;
		}

		let limit = parameters.Limit;

		if(_.isUndefined(aggregated_results)){
			aggregated_results = {
				Items:[],
				ScannedCount:0
			};
		}

		if(_.has(aggregated_results, 'LastEvaluatedKey')){
			parameters.ExclusiveStartKey = aggregated_results.LastEvaluatedKey;
		}

		return this.executeDynamoDBMethod({method: 'scan', parameters: parameters}).then(result => {
			let result_index = 0;

			du.debug('scan results', result);

			if(arrayutilities.nonEmpty(result.Items) > 0){
				//While we haven't met the limit and there are more results in the set.
				while(aggregated_results.Items.length < limit && result_index < result.Items.length){
					aggregated_results.Items.push(result.Items[result_index]);
					result_index++;
				}
			}

			aggregated_results.ScannedCount += result.ScannedCount;

			if(!_.has(result, 'LastEvaluatedKey')){
				if(_.has(aggregated_results, 'LastEvaluatedKey')){
					delete aggregated_results.LastEvaluatedKey;
				}
				aggregated_results.Count = aggregated_results.Items.length;

				return aggregated_results;
			}

			//there are more results
			if(aggregated_results.Items.length === limit){
				aggregated_results.ScannedCount += ((-1 * result.ScannedCount)+ result_index);
				aggregated_results.LastEvaluatedKey = this.determineLastEvaluatedKey(result, (result_index - 1));
				aggregated_results.Count = aggregated_results.Items.length;
				return aggregated_results;
			}else{
				aggregated_results.LastEvaluatedKey = result.LastEvaluatedKey;
			}

			return this.executeRecursiveScan({parameters: parameters, aggregated_results: aggregated_results});
		});
	}

	determineLastEvaluatedKey(result, result_index){

		du.debug('Determine LastEvaluatedKey');

		if(!_.has(result, 'LastEvaluatedKey')){
			throw eu.getError('server', 'determineLastEvaluatedKey requires the LastEvaluatedKey property to be set');
		}

		let last_result_element = result.Items[result_index];
		let new_last_evaluated_key = {};

		objectutilities.map(result.LastEvaluatedKey, key => {

			if(!_.has(last_result_element, key)){
				throw eu.getError('server', 'Last result element requires key "'+key+'".');
			}

			new_last_evaluated_key[key] = last_result_element[key];

		});

		return new_last_evaluated_key;

	}

	countRecords(table, additional_parameters, index){

		du.debug('Count Records');

		var parameters = {
			TableName: table,
			IndexName: index,
			Select: 'COUNT'
		};

		parameters = this.translateParameters(additional_parameters, parameters);

		return this.executeDynamoDBMethod({method: 'query', parameters: parameters});

	}

	saveRecord(table, item){

		du.debug('Save Record');

		item = JSON.parse(JSON.stringify(this.removeEmptyValues(item)));

		var parameters = {
			TableName:table,
			Item:item
		};

		return this.executeDynamoDBMethod({method: 'put', parameters: parameters});

	}

	updateRecord(table, key, expression, expression_params){

		du.debug('Update Record');

		var parameters = {
			TableName:table,
			Key: key,
			UpdateExpression: expression,
			ExpressionAttributeValues:expression_params,
			ReturnValues:"UPDATED_NEW"
		};

		return this.executeDynamoDBMethod({method: 'update', parameters: parameters});

	}

	deleteRecord(table, key, expression, expression_parameters){

		du.debug('Delete Record');

		var parameters = {
			TableName:table,
			Key: key,
			ConditionExpression: expression,
			ExpressionAttributeValues:expression_parameters
		};

		return this.executeDynamoDBMethod({method: 'delete', parameters: parameters});

	}

	//Technical Debt:  This belongs in a query builder helper
	createINQueryParameters(field_name, in_array){

		du.debug('Create IN Query Parameters');

		stringutilities.nonEmpty(field_name, true);
		arrayutilities.nonEmpty(in_array, true);

		if(!arrayutilities.assureEntries(in_array, 'string')){
			throw eu.getError('server', 'All entries in the "in_array" must be of type string.');
		}

		let in_object = {};

		arrayutilities.map(in_array, (value) => {

			//Technical Debt: convert to do,while
			var in_key = ":"+random.createRandomString(10);

			//assure uniqueness
			while(_.has(in_object, in_key)){
				in_key = ":"+random.createRandomString(10);
			}

			in_object[in_key.toString()] = value;

		});

		return {
			filter_expression : field_name+" IN ("+Object.keys(in_object).toString()+ ")",
			expression_attribute_values : in_object
		};

	}

	appendDisjunctionQueryParameters(query_parameters, field_name, array){

		du.debug('Append Disjunction Query Parameters');

		// instantiate query_parameters object if undefined, or complete if incomplete
		if (!query_parameters) {
			query_parameters = {};
		}

		if (!query_parameters.filter_expression) {
			query_parameters.filter_expression = '';
		}

		if (!query_parameters.expression_attribute_names) {
			query_parameters.expression_attribute_names = {};
		}

		if (!query_parameters.expression_attribute_values) {
			query_parameters.expression_attribute_values = {};
		}

		let expression = '';

		// append OR fragment to expression, add value for each element in array and add attribute name
		Object.keys(array).forEach(key => {
			expression += (expression ? ' OR ' : '') + `#${field_name} = :${field_name}v` + key;
			query_parameters.expression_attribute_values[`:${field_name}v` + key] = array[key];
		});

		query_parameters.filter_expression += '(' + expression + ')';
		query_parameters.expression_attribute_names['#' + field_name] = field_name;

		return query_parameters;

	}

	translateParameters(parameters, new_parameter_object){

		du.debug('Translate Parameters');

		if(_.isUndefined(new_parameter_object)){ new_parameter_object = {}; }

		let parameter_map = {
			'key_condition_expression':'KeyConditionExpression',
			'expression_attribute_values':'ExpressionAttributeValues',
			'expression_attribute_names':'ExpressionAttributeNames',
			'filter_expression':'FilterExpression',
			'limit':'Limit',
			'scan_index_forward':'ScanIndexForward',
			'ExclusiveStartKey':'ExclusiveStartKey',
			'exclusive_start_key':'ExclusiveStartKey',
			'Select': 'Select',
			'select': 'Select',
			'index_name':'IndexName',
			'projection_expression':'ProjectionExpression'
		}

		objectutilities.map(parameter_map, key => {
			if(_.has(parameters, key) && !_.isNull(parameters[key])){
				new_parameter_object[parameter_map[key]] = parameters[key];
			}
		});

		return new_parameter_object

	}

	createTable(parameters){

		du.debug('Create Table');

		return this.executeDynamoDBMethod({method: 'createTable', parameters: parameters});

	}

	updateTable(parameters){

		du.debug('Update Table');

		return this.executeDynamoDBMethod({method: 'updateTable', parameters: parameters});

	}

	describeTable(parameters, fatal) {

		du.debug('Describe Table');

		if(_.isString(parameters)){
			parameters = {
				TableName:parameters
			};
		}

		return this.executeDynamoDBMethod({method: 'describeTable', parameters: parameters, fatal: fatal});

	}

	deleteTable(parameters){

		du.debug('Delete Table');

		if(_.isString(parameters)){
			parameters = {
				TableName:parameters
			};
		}

		return this.executeDynamoDBMethod({method: 'deleteTable', parameters: parameters});

	}

	listTables(parameters){

		du.debug('List Tables');

		parameters = (_.isUndefined(parameters) || _.isNull(parameters))?{}:parameters;

		return this.executeDynamoDBMethod({method: 'listTables', parameters: parameters});

	}

	createBackup(parameters){

		du.debug('Create Backup');

		if(_.isString(parameters)){
			parameters = {
				TableName: parameters
			};
		}

		if(!_.has(parameters, 'BackupName')){
			parameters.BackupName = parameters.TableName+'-'+stringutilities.replaceAll(timestamp.getISO8601(),':','.');
		}

		return this.executeDynamoDBMethod({method: 'createBackup', parameters: parameters});

	}

	waitFor(parameters, status){

		du.debug('Wait For');

		if(_.isString(parameters)){
			parameters = {
				TableName:parameters
			};
		}

		return this.executeDynamoDBMethod({method: 'waitFor', status: status, parameters: parameters});

	}

	executeDynamoDBMethod({method, parameters, status, fatal}){

		du.debug('Execute Dynamo DB Method');

		du.debug('Method: '+method);

		du.debug('Parameters', parameters);

		fatal = (_.isUndefined(fatal))?true:fatal;

		let valid_methods = {
			document_client: ['get', 'batchGet', 'scan', 'query', 'put', 'update', 'delete'],
			raw: ['waitFor', 'deleteTable', 'describeTable', 'updateTable', 'createTable', 'createBackup','listTables']
		}

		if(_.includes(valid_methods.document_client, method)){

			return new Promise((resolve, reject) => {

				du.debug('DynamoDB Parameters (last hop):', parameters);

				if(!_.has(this, 'dynamodb')){
					this.instantiateDynamo();
				}

				this.dynamodb[method](parameters, (error, data) => {

					if(error){

						du.error(error);

						if(fatal){
							throw eu.getError('server', error);
						}

						return reject(error);

					}

					return resolve(data);

				});

			});

		}

		if(_.includes(valid_methods.raw, method)){

			return new Promise((resolve, reject) => {

				if(method == 'waitFor'){

					du.debug('DynamoDB Parameters (last hop):', parameters);

					if(!_.has(this, 'dynamoraw')){
						this.instantiateDynamo();
					}

					this.dynamoraw[method](status, parameters, (error, data) => {

						if(_.isError(error)){
							if(fatal){
								throw eu.getError('server', error);
							}
							return reject(error);
						}

						return resolve(data);

					});

				}else{

					du.debug('DynamoDB Parameters (last hop):', parameters);

					if(!_.has(this, 'dynamoraw')){
						this.instantiateDynamo();
					}

					this.dynamoraw[method](parameters, (error, data) => {

						du.error(error);
						if(_.isError(error)){
							if(fatal){
								throw eu.getError('server', error);
							}
							return reject(error);
						}

						return resolve(data);

					});

				}

			});

		}

		throw eu.getError('server', 'Unknown method: '+method);

	}

	batchGet({table_name, ids, parameters}) {

		du.debug('Batch Get');

		if (!parameters) {

			parameters = {
				RequestItems: {}
			};

			let items = arrayutilities.map(ids, (id) => ({ id }));

			parameters.RequestItems[table_name] = {'Keys': items};

		}

		return this.executeDynamoDBMethod({method: 'batchGet', parameters: parameters})
			.then(({Responses}) => Responses);

	}

	test(){

		du.debug('Test');

		return this.describeTable('products').then(result => {
			if(_.has(result, 'Table')){
				return {status:'OK', message: 'Successfully connected to DynamoDB.'};
			}
			return {status:'ERROR', message: 'Could not connect to DynamoDB.'};
		}).catch(error => {
			return {status: 'ERROR', message: error.message};
		})
	}

	removeEmptyValues(data) {
		for(let prop in data) {
			if (typeof data[prop] === 'string' && data[prop].length === 0) {
				delete data[prop];
			} else if (typeof data[prop] === 'object') {
				this.removeEmptyValues(data[prop]);
			}
		}

		return data;
	}
}
