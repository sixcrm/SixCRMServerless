import DynamoDB = require("aws-sdk/clients/dynamodb");

export class DynamoConnector {

	private readonly dynamodb;

	constructor(config) {
		this.dynamodb =  new DynamoDB(config);
	}

	async getOne(name: string, id: string): Promise<any> {

		return this.dynamodb.getItem({
			TableName: `${name}s`,
			Key: {
				'id': {S: id}
			}
		}).promise().then((r) => r.Item);
	}

	async getAll(name: string): Promise<any> {

		return this.dynamodb.scan({
			TableName: `${name}s`,
		}).promise().then((r) => r.Items);
	}


}
