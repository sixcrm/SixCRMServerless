const DynamoClient = require('../../controllers/workers/analytics/transforms/entities/dynamo');

module.exports = class ImportDynamoClient extends DynamoClient {

	/**
	 * **NOTE:** This is intended to be used for import scripts, not transforms.
	 */
	scan(table) {

		return this.client.scan({ TableName: table }).promise();

	}

}
