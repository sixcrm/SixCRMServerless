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

	get(table, key) {

		return this.client.getItem({
			TableName: table,
			Key: { id: { S: key } }
		}).promise();

	}

}
