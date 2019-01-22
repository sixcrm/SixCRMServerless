/* eslint-disable */
require('@6crm/sixcrmcore');
const _ = require('lodash');
const querystring = require('querystring');

const du = require('@6crm/sixcrmcore/lib/util/debug-utilities').default;
const AWSDeploymentUtilities = global.SixCRM.routes.include('deployment', 'utilities/aws-deployment-utilities.js');
const DynamoDBProvider = global.SixCRM.routes.include('controllers', 'providers/dynamodb-provider.js');

const scan_limit = 30000;
const batch_size = 10;

const NMI_SOFT_DECLINE_CODES = ['200', '201', '202', '203', '240', '260', '264', '300', '400', '420', '421'];
const STRIPE_SOFT_DECLINE_KEYWORDS = ['try again', 'general'];

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

		console.log('Performing scan...');

		await this.dynamodbprovider.scanRecords('transactions', {limit: scan_limit}).then(async records => {
			let count = 0;
			for (let transaction of records.Items) {
				count++;
				const response = JSON.parse(transaction.processor_response);
				const result = transaction.result;

				if (!['decline', 'softdecline', 'harddecline', 'soft'].includes(result)) {
					// console.log(`${count}/${records.Items.length}:\tSKIPPING ${transaction.id} ${result}`);
					continue;
				}
				let provider = '';
				if (response.merchant_provider) {
					provider = _(await this.dynamodbprovider.queryRecords('merchantproviders', {
						key_condition_expression: 'id = :primary_keyv',
						expression_attribute_values: {':primary_keyv': response.merchant_provider}
					})).get('Items[0].gateway.name');
				}

				if (!provider) {
					continue;
				}

				let newresult = 'harddecline';

				let code, message;

				if (provider === 'Stripe') {
					code = _(response).get('result.response.statusCode');
					message = _(response).get('result.response.body');

					STRIPE_SOFT_DECLINE_KEYWORDS.forEach(term => {
						if (message.toLowerCase().includes(term)) {
							newresult = 'decline';
						}
					})
				}

				if (provider === 'NMI') {
					code = _(response).get('merchant_code');
					message = _(response).get('merchant_message');
					if (NMI_SOFT_DECLINE_CODES.includes(code)) {
						newresult = 'decline';
					}
				}

				console.log(`${count}/${records.Items.length}\t(${provider}):\t${result} > ${newresult}\t(${code}) - ${message}`);

				// Persist to DynamoDB

				transaction.result = newresult;

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
