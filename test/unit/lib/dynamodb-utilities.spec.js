'use strict'
const mockery = require('mockery');
const chai = require('chai');
const expect = chai.expect;

const du = global.SixCRM.routes.include('lib', 'debug-utilities.js');

let anyItem = { property: 'value' };
let anyTableName = 'tableName';
let serverError = '[500] An error occurred.';

const eu = global.SixCRM.routes.include('lib', 'error-utilities.js');

describe('lib/dynamodb-utilities', () => {

  before(() => {
      mockery.enable({
          useCleanCache: true,
          warnOnReplace: false,
          warnOnUnregistered: false
      });
  });

  beforeEach(() => {
    global.SixCRM.localcache.clear('all');
  });

  afterEach(() => {
      mockery.resetCache();
      mockery.deregisterAll();
  });

  describe('saveRecord', () => {

    it('should save a record', () => {
      // given
      let anItem = anyItem;
      let aTableName = anyTableName;
      let anyResults = { TableName: 'tableName', Item: { property: 'value' } };

      let DynamoDBUtilities = global.SixCRM.routes.include('lib', 'dynamodb-utilities.js');

      DynamoDBUtilities.dynamodb =  {
          put: (params, callback) => {
              callback(null, params);
          }
      };

      return DynamoDBUtilities.saveRecord(aTableName, anItem).then((result) => {
          expect(result).to.deep.equal(anyResults);
      });

    });

    it('should throw an error if saving fails', () => {
      // given
      let anItem = anyItem;
      let aTableName = anyTableName;

      let DynamoDBUtilities = global.SixCRM.routes.include('lib', 'dynamodb-utilities.js');

      DynamoDBUtilities.dynamodb = {
          put: (params, callback) => {
              callback(eu.getError('server','An error occurred.'), 'A stacktrace.');
          }
      };

      return DynamoDBUtilities.saveRecord(aTableName, anItem).catch((error) => {
          expect(error.message).to.equal(serverError);
      });
    });

  });

  describe('retrieveRecord', () => {

    it('should retrieve a record', () => {
      // given
      let anyKey = '1';
      let aTableName = anyTableName;
      let anyResults = { TableName: 'tableName', Key: '1' };

      let DynamoDBUtilities = global.SixCRM.routes.include('lib', 'dynamodb-utilities.js');

      DynamoDBUtilities.dynamodb =  {
          get: (params, callback) => {
              callback(null, params);
          }
      };

      return DynamoDBUtilities.get(aTableName, anyKey).then((result) => {
          expect(result).to.deep.equal(anyResults);
      });
    });

  });

  describe('scanRecord', () => {

    it('should scan records', () => {
      // given
      let aTableName = anyTableName;
      let anyResults = { Items: [{ a: 'b' }, { c: 'd' }]};
      let anyParams = {};

      let DynamoDBUtilities = global.SixCRM.routes.include('lib', 'dynamodb-utilities.js');

      DynamoDBUtilities.dynamodb = {
          scan: (params, callback) => {
              callback(null, anyResults);
          }
      };

      return DynamoDBUtilities.scanRecords(aTableName, anyParams).then((result) => {
          expect(result).to.deep.equal(anyResults);
      });
    });

    it('should return empty results when no records', () => {
      // given
      let aTableName = anyTableName;
      let anyResults = { Items: [] };
      let anyParams = {};

      let DynamoDBUtilities = global.SixCRM.routes.include('lib', 'dynamodb-utilities.js');

      DynamoDBUtilities.dynamodb = {
          scan: (params, callback) => {
              callback(null, anyResults);
          }
      };

      return DynamoDBUtilities.scanRecords(aTableName, anyParams).then((result) => {
          expect(result).to.deep.equal(anyResults);
      });
    });

    it('should retain limits when scanning records', () => {
      // given
      let aTableName = anyTableName;
      let anyResults = { Items: [{ a: 'b' }, { c: 'd' }]};
      let paramsWithLimit = { limit: 1 };

      let DynamoDBUtilities = global.SixCRM.routes.include('lib', 'dynamodb-utilities.js');

      DynamoDBUtilities.dynamodb = {
          scan: (params, callback) => {
              expect(params.Limit).to.equal(paramsWithLimit.limit);
              callback(null, anyResults);
          }
      };

      return DynamoDBUtilities.scanRecords(aTableName, paramsWithLimit).then((result) => {
          expect(result).to.deep.equal(anyResults);
      });
    });

    it('should throw an error if scanning fails', () => {
      // given
      let anItem = anyItem;
      let aTableName = anyTableName;

      let DynamoDBUtilities = global.SixCRM.routes.include('lib', 'dynamodb-utilities.js');

      DynamoDBUtilities.dynamodb = {
          scan: (params, callback) => {
              callback(eu.getError('server','An error occurred.'), 'A stacktrace.');
          }
      };

      return DynamoDBUtilities.scanRecords(aTableName, anItem).catch((error) => {
          expect(error.message).to.equal(serverError);
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

      let DynamoDBUtilities = global.SixCRM.routes.include('lib', 'dynamodb-utilities.js');

      DynamoDBUtilities.dynamodb = {
          query: (params, callback) => {
              callback(null, anyResults);
          }
      };

      return DynamoDBUtilities.queryRecords(aTableName, anyParams, anyIndex).then((result) => {
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


      let DynamoDBUtilities = global.SixCRM.routes.include('lib', 'dynamodb-utilities.js');

      DynamoDBUtilities.dynamodb = {
          query: (params, callback) => {
              callback(null, spoofed_results);
          }
      };

      return DynamoDBUtilities.queryRecords(table_name, parameters, index).then((result) => {
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

      let DynamoDBUtilities = global.SixCRM.routes.include('lib', 'dynamodb-utilities.js');

      DynamoDBUtilities.dynamodb = {
          query: (params, callback) => {
              callback(null, anyResults);
          }
      };

      return DynamoDBUtilities.countRecords(aTableName, anyParams, anyIndex).then((result) => {
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

      let DynamoDBUtilities = global.SixCRM.routes.include('lib', 'dynamodb-utilities.js');

      DynamoDBUtilities.dynamodb = {
          update: (params, callback) => {
              callback(null, params);
          }
      };

      return DynamoDBUtilities.updateRecord(aTableName, anyKey, anyExpression, anyParams).then((result) => {
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

      let DynamoDBUtilities = global.SixCRM.routes.include('lib', 'dynamodb-utilities.js');

      DynamoDBUtilities.dynamodb = {
          delete: (params, callback) => {
              callback(null, params);
          }
      };

      return DynamoDBUtilities.deleteRecord(aTableName, anyKey, anyExpression, anyParams).then((result) => {
          expect(result).to.deep.equal(anyResults);
      });
    });
  });

  describe('createTable', () => {

    it('should create a table', () => {
      // given
      let anyParams = {};
      let anyResults = 'success';

      let DynamoDBUtilities = global.SixCRM.routes.include('lib', 'dynamodb-utilities.js');

      DynamoDBUtilities.dynamoraw =  {
          createTable: (params, callback) => {
              callback(null, anyResults);
          }
      };

      return DynamoDBUtilities.createTable(anyParams).then((result) => {
          expect(result).to.equal(anyResults);
      });
    });
  });

  describe('updateTable', () => {

    it('should update a table', () => {
      // given
      let anyParams = {};
      let anyResults = 'success';

      let DynamoDBUtilities = global.SixCRM.routes.include('lib', 'dynamodb-utilities.js');

      DynamoDBUtilities.dynamoraw =  {
          updateTable: (params, callback) => {
              callback(null, anyResults);
          }
      };

      return DynamoDBUtilities.updateTable(anyParams).then((result) => {
          expect(result).to.equal(anyResults);
      });
    });
  });

  describe('describeTable', () => {

    it('should describe a table', () => {
      // given
      let aTableName = anyTableName;
      let anyResults = { TableName: 'tableName' };

      let DynamoDBUtilities = global.SixCRM.routes.include('lib', 'dynamodb-utilities.js');

      DynamoDBUtilities.dynamoraw =  {
          describeTable: (params, callback) => {
              callback(null, params);
          }
      };

      return DynamoDBUtilities.describeTable(aTableName).then((result) => {
          expect(result).to.deep.equal(anyResults);
      });

    });

  });

  describe('deleteTable', () => {

    it('should delete a table', () => {
      // given
      let aTableName = anyTableName;
      let anyResults = { TableName: 'tableName' };

      let DynamoDBUtilities = global.SixCRM.routes.include('lib', 'dynamodb-utilities.js');

      DynamoDBUtilities.dynamoraw =  {
          deleteTable: (params, callback) => {
              callback(null, params);
          }
      };

      return DynamoDBUtilities.deleteTable(aTableName).then((result) => {
          expect(result).to.deep.equal(anyResults);
      });
    });

    it('throws error when table is not removed', () => {
      // given
      let aTableName = anyTableName;

      let DynamoDBUtilities = global.SixCRM.routes.include('lib', 'dynamodb-utilities.js');

      DynamoDBUtilities.dynamoraw =  {
          deleteTable: (params, callback) => {
              callback(new Error('fail'), null);
          }
      };

      return DynamoDBUtilities.deleteTable(aTableName).catch((error) => {
          expect(error.message).to.deep.equal('[500] fail');
      });
    });

  });

  describe('waitFor', () => {

    it('should wait', () => {
      // given
      let aTableName = anyTableName;
      let anyResults = { TableName: 'tableName' };
      let anyStatus = 'anyStatus';

      let DynamoDBUtilities = global.SixCRM.routes.include('lib', 'dynamodb-utilities.js');

      DynamoDBUtilities.dynamoraw =  {
          waitFor: (status, params, callback) => {
              callback(null, params);
          }
      };

      return DynamoDBUtilities.waitFor(aTableName, anyStatus).then((result) => {
          expect(result).to.deep.equal(anyResults);
      });
    });

    it('throws error from dynamoraw waitFor', () => {
      // given
      let aTableName = anyTableName;
      let anyStatus = 'anyStatus';

      let DynamoDBUtilities = global.SixCRM.routes.include('lib', 'dynamodb-utilities.js');

      DynamoDBUtilities.dynamoraw =  {
          waitFor: (status, params, callback) => {
              callback(new Error('fail'), null);
          }
      };

      return DynamoDBUtilities.waitFor(aTableName, anyStatus).catch((error) => {
          expect(error.message).to.equal('[500] fail');
      });
    });

  });

  describe('createINQueryParameters', () => {

    it('throws error when array entry is not a string', () => {
      // given
      let anyFieldName = 'aFieldName';
      let anyArray = [1]; //array with a value that is not a string

      let DynamoDBUtilities = global.SixCRM.routes.include('lib', 'dynamodb-utilities.js');

      try {
          DynamoDBUtilities.createINQueryParameters(anyFieldName, anyArray)
      }catch(error) {
          expect(error.message).to.equal('[500] All entries in the "in_array" must be of type string.');
      }
    });

    it('should create object with filter expression and attribute values', () => {
      // given
      let anyFieldName = 'aFieldName';
      let anyArray = ['a', 'b'];

      let DynamoDBUtilities = global.SixCRM.routes.include('lib', 'dynamodb-utilities.js');
      let inqueryParams = DynamoDBUtilities.createINQueryParameters(anyFieldName, anyArray);

      expect(inqueryParams).to.have.property('filter_expression');
      expect(inqueryParams).to.have.property('expression_attribute_values');
    });

  });

  describe('appendDisjunctionQueryParameters', () => {

    it('should create disjunction parameters when existing parameters are undefined', () => {

      let DynamoDBUtilities = global.SixCRM.routes.include('lib', 'dynamodb-utilities.js');
      const result = DynamoDBUtilities.appendDisjunctionQueryParameters(undefined, 'type', ['type1', 'type2']);

      expect(result.expression_attribute_names).to.deep.equal({'#type': 'type'});
      expect(result.expression_attribute_values).to.deep.equal({':typev0': 'type1', ':typev1': 'type2'});
      expect(result.filter_expression).to.equal('(#type = :typev0 OR #type = :typev1)');
    });

    it('should create disjunction parameters when existing parameters are incomplete', () => {
      let query_parameters = {
          filter_expression: 'sample_query AND ',
      };
      let DynamoDBUtilities = global.SixCRM.routes.include('lib', 'dynamodb-utilities.js');
      const result = DynamoDBUtilities.appendDisjunctionQueryParameters(query_parameters, 'type', ['type1', 'type2']);

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
      let DynamoDBUtilities = global.SixCRM.routes.include('lib', 'dynamodb-utilities.js');
      const result = DynamoDBUtilities.appendDisjunctionQueryParameters(query_parameters, 'type', ['type1', 'type2']);

      expect(result.expression_attribute_names).to.deep.equal({'#sample': 'sample','#type': 'type'});
      expect(result.expression_attribute_values).to.deep.equal({':samplev': 'sample', ':typev0': 'type1', ':typev1': 'type2'});
      expect(result.filter_expression).to.equal('sample_query AND (#type = :typev0 OR #type = :typev1)');
    });

  });
});
