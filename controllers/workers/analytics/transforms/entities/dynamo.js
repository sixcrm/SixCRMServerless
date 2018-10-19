const du = require('@6crm/sixcrmcore/util/debug-utilities').default;
const aws = require('aws-sdk');

module.exports = class DynamoClient {

	constructor() {

		du.debug('DynamoClient Constructor');

		const dynamoConfig = global.SixCRM.configuration.site_config.dynamodb;
		let parameters = {
			region: dynamoConfig && dynamoConfig.region || global.SixCRM.configuration.site_config.aws.region
		};

		if (dynamoConfig && dynamoConfig.endpoint) {
			parameters.endpoint = dynamoConfig.endpoint;
		}

		this.client = new aws.DynamoDB.DocumentClient(parameters);

	}

	async get(table, key) {

		const response = await this.client.get({
			TableName: table,
			Key: { id: key }
		}).promise();

		return response.Item;

	}

	put(table, item) {

		return this.client.put({
			TableName: table,
			Item: item
		}).promise();

	}

	putBatch(table, items) {

		let RequestItems = {};
		RequestItems[table] = items.map(item => ({ PutRequest: { Item: item } }));

		return this.client.batchWrite({	RequestItems }).promise();

	}

}
