
const mockery = require('mockery');
const chai = require('chai');
const expect = chai.expect;

const du = require('@6crm/sixcrmcore/util/debug-utilities').default;

let anyItem = { property: 'value' };
let anyTableName = 'tableName';

const eu = require('@6crm/sixcrmcore/util/error-utilities').default;
const AWSTestUtils = require('./aws-test-utils');

describe('controllers/providers/dynamodb-provider', () => {

	before(() => {
		mockery.enable({
			useCleanCache: true,
			warnOnReplace: false,
			warnOnUnregistered: false
		});
	});

	afterEach(() => {
		mockery.resetCache();
		mockery.deregisterAll();
	});

	after(() => {
		mockery.disable();
	});

	describe('saveRecord', () => {

		it('should save a record', () => {
			// given
			let anItem = anyItem;
			let aTableName = anyTableName;
			let anyResults = { TableName: 'tableName', Item: { property: 'value' } };

			let DynamoDBProvider = global.SixCRM.routes.include('controllers', 'providers/dynamodb-provider.js');
			const dynamodbprovider = new DynamoDBProvider();

			dynamodbprovider.dynamodb =  {
				put: AWSTestUtils.AWSPromise(anyResults)
			};

			return dynamodbprovider.saveRecord(aTableName, anItem).then((result) => {
				expect(result).to.deep.equal(anyResults);
			});

		});

		it('should throw an error if saving fails', () => {
			// given
			let anItem = anyItem;
			let aTableName = anyTableName;

			let DynamoDBProvider = global.SixCRM.routes.include('controllers', 'providers/dynamodb-provider.js');
			const dynamodbprovider = new DynamoDBProvider();

			dynamodbprovider.dynamodb = {
				put: AWSTestUtils.AWSError('An error occurred.')
			};

			return dynamodbprovider.saveRecord(aTableName, anItem).catch((error) => {
				expect(error.message).to.equal('An error occurred.');
			});
		});

	});

	describe('retrieveRecord', () => {

		it('should retrieve a record', () => {
			// given
			let anyKey = '1';
			let aTableName = anyTableName;
			let anyResults = { TableName: 'tableName', Key: '1' };

			let DynamoDBProvider = global.SixCRM.routes.include('controllers', 'providers/dynamodb-provider.js');
			const dynamodbprovider = new DynamoDBProvider();

			dynamodbprovider.dynamodb =  {
				get: AWSTestUtils.AWSPromise(anyResults)
			};

			return dynamodbprovider.get(aTableName, anyKey).then((result) => {
				expect(result).to.deep.equal(anyResults);
			});
		});

	});

	describe('scanRecord', () => {

		it('should scan records', () => {
			// given
			let aTableName = anyTableName;
			let anyResults = { Count: 2, Items: [{ a: 'b' }, { c: 'd' }], ScannedCount: 100 };
			let anyParams = {};

			let DynamoDBProvider = global.SixCRM.routes.include('controllers', 'providers/dynamodb-provider.js');
			const dynamodbprovider = new DynamoDBProvider();

			dynamodbprovider.dynamodb = {
				scan: AWSTestUtils.AWSPromise(anyResults)
			};

			return dynamodbprovider.scanRecords(aTableName, anyParams).then((result) => {
				expect(result).to.deep.equal(anyResults);
			});
		});

		it('should return empty results when no records', () => {
			// given
			let aTableName = anyTableName;
			let anyResults = { Count: 0, Items: [], ScannedCount: 100 };
			let anyParams = {};

			let DynamoDBProvider = global.SixCRM.routes.include('controllers', 'providers/dynamodb-provider.js');
			const dynamodbprovider = new DynamoDBProvider();

			dynamodbprovider.dynamodb = {
				scan: AWSTestUtils.AWSPromise(anyResults)
			};

			return dynamodbprovider.scanRecords(aTableName, anyParams).then((result) => {
				expect(result).to.deep.equal(anyResults);
			});
		});

		it('should retain limits when scanning records', () => {
			// given
			let aTableName = anyTableName;
			let items = [{ a: 'b' }, { c: 'd' }];
			let anyResults = { Count: 2, Items: items, ScannedCount: 100 };
			let paramsWithLimit = { limit: 1 };

			let DynamoDBProvider = global.SixCRM.routes.include('controllers', 'providers/dynamodb-provider.js');
			const dynamodbprovider = new DynamoDBProvider();

			dynamodbprovider.dynamodb = {
				scan: AWSTestUtils.AWSPromise(anyResults)
			};

			return dynamodbprovider.scanRecords(aTableName, paramsWithLimit).then((result) => {
				expect(result).to.deep.equal({
					Count: 1,
					Items: [items[0]],
					ScannedCount: 100
				});
			});
		});

		it('should throw an error if scanning fails', () => {
			// given
			let anItem = anyItem;
			let aTableName = anyTableName;

			let DynamoDBProvider = global.SixCRM.routes.include('controllers', 'providers/dynamodb-provider.js');
			const dynamodbprovider = new DynamoDBProvider();

			dynamodbprovider.dynamodb = {
				scan: AWSTestUtils.AWSError('An error occurred.')
			};

			return dynamodbprovider.scanRecords(aTableName, anItem).catch((error) => {
				expect(error.message).to.equal('An error occurred.');
			});
		});

	});

	describe('queryRecord', () => {

		it('should query records', () => {
			// given
			let aTableName = anyTableName;
			let anyResults = { Items: [{ a: 'b' }, { c: 'd' }]};
			let anyParams = {};
			let anyIndex = 0;

			let DynamoDBProvider = global.SixCRM.routes.include('controllers', 'providers/dynamodb-provider.js');
			const dynamodbprovider = new DynamoDBProvider();

			dynamodbprovider.dynamodb = {
				query: AWSTestUtils.AWSPromise(anyResults)
			};

			return dynamodbprovider.queryRecords(aTableName, anyParams, anyIndex).then((result) => {
				du.info(result);
				expect(result).to.deep.equal(anyResults);
			});
		});
	});

	describe('executeRecursiveQuery', () => {

		it('should execute a recursive query and return a single result', () => {

			let table_name = 'sessions';
			let index = 'account-index';
			let parameters = {
				key_condition_expression: '#account_k = :account_v',
				expression_attribute_values:{
					':account_v':"d3fa3bf3-7824-49f4-8261-87674482bf1c",
					':cid_v':"fb10d33f-da7d-4765-9b2b-4e5e42287726"
				},
				expression_attribute_names:{
					'#account_k':"account",
					'#cid_k':"cid"
				},
				filter_expression:'#cid_k = :cid_v',
				limit: 1
			};

			let spoofed_results = {
				Items: [
					{
						completed: false,
						subaffiliate_5: '45f025bb-a9dc-45c7-86d8-d4b7a4443426',
						created_at: '2017-04-06T18:40:41.405Z',
						subaffiliate_2: '22524f47-9db7-42f9-9540-d34a8909b072',
						subaffiliate_1: '6b6331f6-7f84-437a-9ac6-093ba301e455',
						subaffiliate_4: 'd515c0df-f9e4-4a87-8fe8-c53dcace0995',
						subaffiliate_3: 'fd2548db-66a8-481e-aacc-b2b76a88fea7',
						product_schedules: [ '2200669e-5e49-4335-9995-9c02f041d91b' ],
						updated_at: '2017-12-13T20:19:13.126Z',
						affiliate: '332611c7-8940-42b5-b097-c49a765e055a',
						account: 'd3fa3bf3-7824-49f4-8261-87674482bf1c',
						customer: '24f7c851-29d4-4af9-87c5-0298fa74c689',
						campaign: '70a6689a-5814-438b-b9fd-dd484d0812f9',
						cid: 'fb10d33f-da7d-4765-9b2b-4e5e42287726',
						id: '1fc8a2ef-0db7-4c12-8ee9-fcb7bc6b075d'
					}
				],
				Count: 1,
				ScannedCount: 1,
				LastEvaluatedKey:{
					account: 'd3fa3bf3-7824-49f4-8261-87674482bf1c',
					id: '1fc8a2ef-0db7-4c12-8ee9-fcb7bc6b075d'
				}
			};


			let DynamoDBProvider = global.SixCRM.routes.include('controllers', 'providers/dynamodb-provider.js');
			const dynamodbprovider = new DynamoDBProvider();

			dynamodbprovider.dynamodb = {
				query: AWSTestUtils.AWSPromise(spoofed_results)
			};

			return dynamodbprovider.queryRecords(table_name, parameters, index).then((result) => {
				expect(result).to.deep.equal(spoofed_results);
			});

		});

	});

	describe('countRecord', () => {

		it('should count records', () => {
			// given
			let aTableName = anyTableName;
			let anyResults = { Count: 2};
			let anyParams = {};
			let anyIndex = 0;

			let DynamoDBProvider = global.SixCRM.routes.include('controllers', 'providers/dynamodb-provider.js');
			const dynamodbprovider = new DynamoDBProvider();

			dynamodbprovider.dynamodb = {
				query: AWSTestUtils.AWSPromise(anyResults)
			};

			return dynamodbprovider.countRecords(aTableName, anyParams, anyIndex).then((result) => {
				expect(result).to.deep.equal(anyResults);
			});
		});
	});

	describe('updateRecord', () => {

		it('should update records', () => {
			// given
			let aTableName = anyTableName;
			let anyParams = {};
			let anyKey = '1';
			let anyExpression = '';
			let anyResult = {
				TableName: 'tableName',
				Key: '1',
				UpdateExpression: '',
				ExpressionAttributeValues: {},
				ReturnValues: 'UPDATED_NEW' //default value
			};

			let DynamoDBProvider = global.SixCRM.routes.include('controllers', 'providers/dynamodb-provider.js');
			const dynamodbprovider = new DynamoDBProvider();

			dynamodbprovider.dynamodb = {
				update: AWSTestUtils.AWSPromise(anyResult)
			};

			return dynamodbprovider.updateRecord(aTableName, anyKey, anyExpression, anyParams).then((result) => {
				expect(result).to.deep.equal(anyResult);
			});
		});
	});

	describe('deleteRecord', () => {
		it('should delete a record', () => {
			// given
			let aTableName = anyTableName;
			let anyParams = {};
			let anyKey = '1';
			let anyExpression = '';
			let anyResults = {
				TableName: 'tableName',
				Key: '1',
				ConditionExpression: '',
				ExpressionAttributeValues: {}
			};

			let DynamoDBProvider = global.SixCRM.routes.include('controllers', 'providers/dynamodb-provider.js');
			const dynamodbprovider = new DynamoDBProvider();

			dynamodbprovider.dynamodb = {
				delete: AWSTestUtils.AWSPromise(anyResults)
			};

			return dynamodbprovider.deleteRecord(aTableName, anyKey, anyExpression, anyParams).then((result) => {
				expect(result).to.deep.equal(anyResults);
			});
		});
	});

	describe('createTable', () => {

		it('should create a table', () => {
			// given
			let anyParams = {};
			let anyResults = 'success';

			let DynamoDBProvider = global.SixCRM.routes.include('controllers', 'providers/dynamodb-provider.js');
			const dynamodbprovider = new DynamoDBProvider();

			dynamodbprovider.dynamoraw =  {
				createTable: AWSTestUtils.AWSPromise(anyResults)
			};

			return dynamodbprovider.createTable(anyParams).then((result) => {
				expect(result).to.equal(anyResults);
			});
		});
	});

	describe('updateTable', () => {

		it('should update a table', () => {
			// given
			let anyParams = {};
			let anyResults = 'success';

			let DynamoDBProvider = global.SixCRM.routes.include('controllers', 'providers/dynamodb-provider.js');
			const dynamodbprovider = new DynamoDBProvider();

			dynamodbprovider.dynamoraw =  {
				updateTable: AWSTestUtils.AWSPromise(anyResults)
			};

			return dynamodbprovider.updateTable(anyParams).then((result) => {
				expect(result).to.equal(anyResults);
			});
		});
	});

	describe('describeTable', () => {

		it('should describe a table', () => {
			// given
			let aTableName = anyTableName;
			let anyResults = { TableName: 'tableName' };

			let DynamoDBProvider = global.SixCRM.routes.include('controllers', 'providers/dynamodb-provider.js');
			const dynamodbprovider = new DynamoDBProvider();

			dynamodbprovider.dynamoraw =  {
				describeTable: AWSTestUtils.AWSPromise(anyResults)
			};

			return dynamodbprovider.describeTable(aTableName).then((result) => {
				expect(result).to.deep.equal(anyResults);
			});

		});

	});

	describe('deleteTable', () => {

		it('should delete a table', () => {
			// given
			let aTableName = anyTableName;
			let anyResults = { TableName: 'tableName' };

			let DynamoDBProvider = global.SixCRM.routes.include('controllers', 'providers/dynamodb-provider.js');
			const dynamodbprovider = new DynamoDBProvider();

			dynamodbprovider.dynamoraw =  {
				deleteTable: AWSTestUtils.AWSPromise(anyResults)
			};

			return dynamodbprovider.deleteTable(aTableName).then((result) => {
				expect(result).to.deep.equal(anyResults);
			});
		});

		it('throws error when table is not removed', () => {
			// given
			let aTableName = anyTableName;

			let DynamoDBProvider = global.SixCRM.routes.include('controllers', 'providers/dynamodb-provider.js');
			const dynamodbprovider = new DynamoDBProvider();

			dynamodbprovider.dynamoraw =  {
				deleteTable: AWSTestUtils.AWSError('fail')
			};

			return dynamodbprovider.deleteTable(aTableName).catch((error) => {
				expect(error.message).to.deep.equal('fail');
			});
		});

	});

	describe('waitFor', () => {

		it('should wait', () => {
			// given
			let aTableName = anyTableName;
			let anyResults = { TableName: 'tableName' };
			let anyStatus = 'anyStatus';

			let DynamoDBProvider = global.SixCRM.routes.include('controllers', 'providers/dynamodb-provider.js');
			const dynamodbprovider = new DynamoDBProvider();

			dynamodbprovider.dynamoraw =  {
				waitFor: AWSTestUtils.AWSPromise(anyResults)
			};

			return dynamodbprovider.waitFor(aTableName, anyStatus).then((result) => {
				expect(result).to.deep.equal(anyResults);
			});
		});

		it('throws error from dynamoraw waitFor', () => {
			// given
			let aTableName = anyTableName;
			let anyStatus = 'anyStatus';

			let DynamoDBProvider = global.SixCRM.routes.include('controllers', 'providers/dynamodb-provider.js');
			const dynamodbprovider = new DynamoDBProvider();

			dynamodbprovider.dynamoraw =  {
				waitFor: AWSTestUtils.AWSError('fail')
			};

			return dynamodbprovider.waitFor(aTableName, anyStatus).catch((error) => {
				expect(error.message).to.equal('fail');
			});
		});

	});

	describe('createINQueryParameters', () => {

		it('throws error when array entry is not a string', () => {
			// given
			let anyFieldName = 'aFieldName';
			let anyArray = [1]; //array with a value that is not a string

			let DynamoDBProvider = global.SixCRM.routes.include('controllers', 'providers/dynamodb-provider.js');
			const dynamodbprovider = new DynamoDBProvider();

			try {
				dynamodbprovider.createINQueryParameters(anyFieldName, anyArray)
			}catch(error) {
				expect(error.message).to.equal('[500] All entries in the "in_array" must be of type string.');
			}
		});

		it('should create object with filter expression and attribute values', () => {
			// given
			let anyFieldName = 'aFieldName';
			let anyArray = ['a', 'b'];

			let DynamoDBProvider = global.SixCRM.routes.include('controllers', 'providers/dynamodb-provider.js');
			const dynamodbprovider = new DynamoDBProvider();
			let inqueryParams = dynamodbprovider.createINQueryParameters(anyFieldName, anyArray);

			expect(inqueryParams).to.have.property('filter_expression');
			expect(inqueryParams).to.have.property('expression_attribute_values');
		});

	});

	describe('appendDisjunctionQueryParameters', () => {

		it('should create disjunction parameters when existing parameters are undefined', () => {

			let DynamoDBProvider = global.SixCRM.routes.include('controllers', 'providers/dynamodb-provider.js');
			const dynamodbprovider = new DynamoDBProvider();
			const result = dynamodbprovider.appendDisjunctionQueryParameters(undefined, 'type', ['type1', 'type2']);

			expect(result.expression_attribute_names).to.deep.equal({'#type': 'type'});
			expect(result.expression_attribute_values).to.deep.equal({':typev0': 'type1', ':typev1': 'type2'});
			expect(result.filter_expression).to.equal('(#type = :typev0 OR #type = :typev1)');
		});

		it('should create disjunction parameters when existing parameters are incomplete', () => {
			let query_parameters = {
				filter_expression: 'sample_query AND ',
			};
			let DynamoDBProvider = global.SixCRM.routes.include('controllers', 'providers/dynamodb-provider.js');
			const dynamodbprovider = new DynamoDBProvider();
			const result = dynamodbprovider.appendDisjunctionQueryParameters(query_parameters, 'type', ['type1', 'type2']);

			expect(result.expression_attribute_names).to.deep.equal({'#type': 'type'});
			expect(result.expression_attribute_values).to.deep.equal({':typev0': 'type1', ':typev1': 'type2'});
			expect(result.filter_expression).to.equal('sample_query AND (#type = :typev0 OR #type = :typev1)');
		});

		it('should create disjunction parameters when existing parameters are complete', () => {
			let query_parameters = {
				expression_attribute_names: {'#sample': 'sample'},
				expression_attribute_values: {':samplev': 'sample'},
				filter_expression: 'sample_query AND '
			};
			let DynamoDBProvider = global.SixCRM.routes.include('controllers', 'providers/dynamodb-provider.js');
			const dynamodbprovider = new DynamoDBProvider();
			const result = dynamodbprovider.appendDisjunctionQueryParameters(query_parameters, 'type', ['type1', 'type2']);

			expect(result.expression_attribute_names).to.deep.equal({'#sample': 'sample','#type': 'type'});
			expect(result.expression_attribute_values).to.deep.equal({':samplev': 'sample', ':typev0': 'type1', ':typev1': 'type2'});
			expect(result.filter_expression).to.equal('sample_query AND (#type = :typev0 OR #type = :typev1)');
		});

	});
});
