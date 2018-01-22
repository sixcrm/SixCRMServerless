const expect = require('chai').expect;
const TestUtils = require('./test-utils.js');
const du = global.SixCRM.routes.include('lib','debug-utilities.js');
const random = global.SixCRM.routes.include('lib', 'random.js');

describe('Test connections to Docker Services', () => {

  describe('DynamoDB', () => {

    it('successfully connects to the Docker DynamoDB instance', () => {

      let dynamodb = global.SixCRM.routes.include('lib', 'dynamodb-utilities.js');

      expect(dynamodb).to.have.property('dynamodb');
      expect(dynamodb).to.have.property('dynamoraw');

      return dynamodb.listTables({}).then(result => {
        expect(result).to.have.property('TableNames');
      });

    });

  });

  describe('SQS', () => {

    it('successfully connects to the Docker SQS instance', () => {

      let sqsutilities = global.SixCRM.routes.include('lib', 'sqs-utilities.js');

      expect(sqsutilities).to.have.property('sqs');

      return sqsutilities.listQueues().then(result => {
        expect(result).to.have.property('ResponseMetadata');
      })

    });

  });

  describe('Redshift Query Utilities', () => {

    it('successfully connects to the Docker Redshift Instance', () => {

      let redshiftqueryutilities = global.SixCRM.routes.include('lib', 'redshift-query-utilities.js');

      return redshiftqueryutilities.query('SELECT 1').then(result => {
        expect(result[0]['?column?']).to.equal(1);
      });

    });

  });

  describe('Elasticache', () => {

    it('successfully connects to the Docker Elasticache Instance', () => {

      let redisutilities = global.SixCRM.routes.include('lib', 'redis-utilities.js');

      expect(redisutilities).to.have.property('endpoint');

      let test_value = random.createRandomString(20);

      return redisutilities.set('test', {'abc':test_value})
      .then((result) => {
        expect(result).to.equal('OK');
        return redisutilities.get('test');
      })
      .then((result) => {
        expect(result.abc).to.equal(test_value);
      })

    });

  });

});
