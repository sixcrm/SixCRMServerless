'use strict';
require('../../SixCRMLite.js');

const expect = require('chai').expect;
const du = global.SixCRM.routes.include('lib', 'debug-utilities.js');
const random = global.SixCRM.routes.include('lib', 'random.js');
const redshiftContext = global.SixCRM.routes.include('lib', 'analytics/redshift-context.js');
const auroraContext = global.SixCRM.routes.include('lib', 'analytics/aurora-context.js');

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

  describe('Aurora', () => {

    it('successfully connects to the Docker Aurora Instance', () => {

      return auroraContext.withConnection((connection => {

        return connection.query('SELECT 1')
          .then((result) => {

            return expect(result.rows[0]['?column?']).to.equal(1);

          })
          .catch(ex => {

            du.error(ex);

            throw ex;

          });

      }));

    });

  });

  describe('Redshift', () => {

    it('successfully connects to the Docker Redshift Instance', () => {

      return redshiftContext.withConnection((connection => {

        return connection.query('SELECT 1')
          .then((result) => {

            return expect(result.rows[0]['?column?']).to.equal(1);

          })
          .catch(ex => {

            du.error(ex);

            throw ex;

          });

      }));

    });

  });

  describe('Elasticache', () => {

    it('successfully connects to the Docker Elasticache Instance', () => {

      let redisutilities = global.SixCRM.routes.include('lib', 'redis-utilities.js');

      expect(redisutilities).to.have.property('endpoint');

      let test_value = random.createRandomString(20);

      return redisutilities.set('test', {'abc': test_value})
        .then((result) => {
          expect(result).to.equal('OK');
          return redisutilities.get('test');
        })
        .then((result) => {
          expect(result.abc).to.equal(test_value);
        })

    });

  });

  describe('SNS Utilities', () => {

    it('successfully connects to the Docker SNS Instance', () => {

      let snsutilities = global.SixCRM.routes.include('lib', 'sns-utilities.js');

      return snsutilities.createTopic({"Name": "events"})
        .then((response) => {
          expect(response).to.have.property('ResponseMetadata');
        })

    });

  });

});
