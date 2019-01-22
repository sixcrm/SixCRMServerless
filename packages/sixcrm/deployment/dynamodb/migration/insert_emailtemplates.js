/* eslint-disable */
require('@6crm/sixcrmcore');
const _ = require('lodash');
const fs = require('fs');
const uuid = require('uuid/v4');

const du = require('@6crm/sixcrmcore/lib/util/debug-utilities').default;
const AWSDeploymentUtilities = global.SixCRM.routes.include('deployment', 'utilities/aws-deployment-utilities.js');
const DynamoDBProvider = global.SixCRM.routes.include('controllers', 'providers/dynamodb-provider.js');

const table_templates = 'emailtemplates';
const table_accounts = 'accounts';
const scan_limit = 10000;

function sleep(ms){
	return new Promise(resolve=>{
		setTimeout(resolve,ms)
	})
}

class EmailTemplateMigration extends AWSDeploymentUtilities {

	constructor(){

		super();

		this.dynamodbprovider = new DynamoDBProvider();

		this.seeds = fs.readdirSync(`${__dirname}/emailtemplates`).map(filename => require(`${__dirname}/emailtemplates/${filename}`));

	}

	insertTemplates() {
		return this.dynamodbprovider.scanRecords(table_accounts, {limit: scan_limit}).then(async records => {
			for (const account of records.Items) {
				console.log(`┌${account.id}`);
				for (let [i, seed] of this.seeds.entries()) {
					seed.id = uuid();
					seed.account = account.id;

					let char = '└';
					if (i !== this.seeds.length-1) char = '├';
					console.log(`${char}─${seed.id}`);

					// this.dynamodbprovider.saveRecord(table_templates, seed)
					await sleep(5);
				}

			}

			console.log(records.Items.length);
		})
	}

	deleteBuiltIn() {
		return this.dynamodbprovider.scanRecords(table_templates, {limit: scan_limit}).then(async records => {
			for (const template of records.Items.filter(t => t.built_in)) {
				console.log(template.id);
				this.dynamodbprovider.deleteRecord(table_templates, {id: template.id});
				await sleep(5);
			}

			console.log(records.Items.length)
		})
	}

}

new EmailTemplateMigration().deleteBuiltIn();
new EmailTemplateMigration().insertTemplates();
