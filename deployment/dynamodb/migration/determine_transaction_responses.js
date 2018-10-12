/* eslint-disable */
require('@6crm/sixcrmcore');
const _ = require('lodash');
const querystring = require('querystring');

const du = require('@6crm/sixcrmcore/util/debug-utilities').default;
const AWSDeploymentUtilities = global.SixCRM.routes.include('deployment', 'utilities/aws-deployment-utilities.js');
const DynamoDBProvider = global.SixCRM.routes.include('controllers', 'providers/dynamodb-provider.js');

const scan_limit = 25000;
const batch_size = 10;

function sleep(ms){
	return new Promise(resolve=>{
		setTimeout(resolve,ms)
	})
}

class EmailTemplateMigration extends AWSDeploymentUtilities {

	constructor(){

		super();

		this.dynamodbprovider = new DynamoDBProvider();
	}

	async execute() {
		let batch = [];

		await this.dynamodbprovider.scanRecords('transactions', {limit: scan_limit}).then(async records => {
			let count = 0;
			for (let transaction of records.Items) {
				const response = JSON.parse(transaction.processor_response);

				if (response.merchant_message) {
					console.log(`${++count}/${records.Items.length}: SKIPPING`);
					continue;
				}

				let merchant_response = null;
				let merchant_message = null;
				let merchant_code = null;

				merchant_response =_(response).get('result', merchant_response);
				merchant_response =_(response).get('response.body', merchant_response);
				merchant_response =_(response).get('result.response.body', merchant_response);

				if (typeof merchant_response === 'string') {
					merchant_message = querystring.parse(merchant_response).responsetext;
					merchant_code = querystring.parse(merchant_response).response_code;

					if (!merchant_message) {
						merchant_message = merchant_response;
					}
				}

				if (typeof merchant_response === 'object') {
					merchant_message = _(merchant_response).get('failure_message', merchant_message);
					merchant_code = _(merchant_response).get('failure_code', merchant_code);

					merchant_message = _(merchant_response).get('response.response_code', merchant_message);
					merchant_code = _(merchant_response).get('response.response_code', merchant_code);

					if (!merchant_message && !merchant_code && merchant_response.object === 'refund') {
						merchant_code = merchant_response.status;
						merchant_message = merchant_response.reason;
					}

					if (!merchant_message && !merchant_code && merchant_response.object === 'charge') {
						merchant_code = '200';
						merchant_message = 'Success'
					}


					if (!merchant_message && !merchant_code && merchant_response.response) {
						merchant_code = merchant_response.response;
						merchant_message = merchant_response.responsetext
					}
				}

				if (merchant_message === 'SUCCESS' || merchant_message === 'succeeded' || merchant_message === '100') {
					merchant_message = 'Success'
				}

				merchant_code = merchant_code || '0';
				merchant_message = merchant_message || '';

				if (merchant_message.length >= 255) {
					merchant_message = 'Unexpected response'
				}

				console.log(`${++count}/${records.Items.length}: ${merchant_code} - ${merchant_message}`);

				// Persist to DynamoDB

				response.merchant_code = merchant_code;
				response.merchant_message = merchant_message;

				transaction.processor_response = JSON.stringify(response);

				batch.push(this.dynamodbprovider.saveRecord('transactions', transaction));

				if (batch.length === batch_size) {
					await Promise.all(batch);
					batch = [];
				}
			}
		});

		if (batch.length) {
			await Promise.all(batch);
		}
	}


}

new EmailTemplateMigration().execute();
