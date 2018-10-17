const DynamoClient = require('../../controllers/workers/analytics/transforms/entities/dynamo');

module.exports = class ImportDynamoClient extends DynamoClient {

	/**
	 * **NOTE:** This is intended to be used for import scripts, not transforms.
	 */
	async scan(table) {

		let items = [];
		let result = {};
		do {

			let params = {
				TableName: table
			};
			if (result.LastEvaluatedKey) {
				params.ExclusiveStartKey = result.LastEvaluatedKey;
			}

			result = await this.client.scan(params).promise();

			items = items.concat(result.Items);

		} while (result.LastEvaluatedKey);

		return items;

	}

}
