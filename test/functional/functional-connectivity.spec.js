require('@6crm/sixcrmcore');

const expect = require('chai').expect;
const du = require('@6crm/sixcrmcore/util/debug-utilities').default;
const auroraContext = require('@6crm/sixcrmcore/util/analytics/aurora-context').default;
const DynamoDBProvider = global.SixCRM.routes.include('controllers', 'providers/dynamodb-provider.js');

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

			const SQSProvider = global.SixCRM.routes.include('controllers', 'providers/sqs-provider.js');
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

	describe('SNS Utilities', () => {

		it('successfully connects to the Docker SNS Instance', () => {

			const SNSProvider = global.SixCRM.routes.include('controllers', 'providers/sns-provider.js');
			let snsprovider = new SNSProvider();

			return snsprovider.createTopic({"Name": "events"})
				.then((response) => {
					expect(response).to.have.property('ResponseMetadata');
				})

		});

	});

});
