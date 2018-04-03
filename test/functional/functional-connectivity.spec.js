'use strict';
require('../../SixCRMLite.js');

const expect = require('chai').expect;
const du = global.SixCRM.routes.include('lib', 'debug-utilities.js');
const random = global.SixCRM.routes.include('lib', 'random.js');
const redshiftContext = global.SixCRM.routes.include('lib', 'analytics/redshift-context.js');
const auroraContext = global.SixCRM.routes.include('lib', 'analytics/aurora-context.js');
const DynamoDBProvider = global.SixCRM.routes.include('lib', 'providers/dynamodb-provider.js');

describe('Test connections to Docker Services', () => {

  describe('DynamoDB', () => {

    it('successfully connects to the Docker DynamoDB instance', () => {

      let dynamodb = new DynamoDBProvider();

      return dynamodb.listTables({}).then(result => {
        expect(result).to.have.property('TableNames');
      });

    });

  });

  describe('SQS', () => {

    it('successfully connects to the Docker SQS instance', () => {

        const SQSProvider = global.SixCRM.routes.include('lib', 'providers/sqs-provider.js');
        const sqsprovider = new SQSProvider();

      return sqsprovider.listQueues().then(result => {
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

      const RedisProvider = global.SixCRM.routes.include('lib', 'providers/redis-provider.js');
      let redisprovider = new RedisProvider();

      expect(redisprovider).to.have.property('endpoint');

      let test_value = random.createRandomString(20);

      return redisprovider.set('test', {'abc': test_value})
        .then((result) => {
          expect(result).to.equal('OK');
          return redisprovider.get('test');
        })
        .then((result) => {
          expect(result.abc).to.equal(test_value);
        })

    });

  });

  describe('SNS Utilities', () => {

    it('successfully connects to the Docker SNS Instance', () => {

      const SNSProvider = global.SixCRM.routes.include('lib', 'providers/sns-provider.js');
      let snsprovider = new SNSProvider();

      return snsprovider.createTopic({"Name": "events"})
        .then((response) => {
          expect(response).to.have.property('ResponseMetadata');
        })

    });

  });

});
