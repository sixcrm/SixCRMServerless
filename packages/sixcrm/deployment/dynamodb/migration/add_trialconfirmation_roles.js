/* eslint-disable */
require('@6crm/sixcrmcore');

const AWSDeploymentUtilities = global.SixCRM.routes.include('deployment', 'utilities/aws-deployment-utilities.js');
const DynamoDBProvider = global.SixCRM.routes.include('controllers', 'providers/dynamodb-provider.js');

const scan_limit = 30000;
const batch_size = 10;


function sleep(ms){
	return new Promise(resolve=>{
		setTimeout(resolve,ms)
	})
}

class TrialConfirmationRoleMigration extends AWSDeploymentUtilities {

	constructor(){

		super();

		this.dynamodbprovider = new DynamoDBProvider();
	}

	async execute() {
		console.log('Performing scan...');

		await this.dynamodbprovider.scanRecords('roles', {limit: scan_limit}).then(async records => {
			for (const role of records.Items) {

				if (!(role.name === 'Administrator' && role.account === '*')) {
					continue;
				}

				console.log(`Updating role with ID ${role.id}`);
				role.permissions.allow.push('smsprovider/*');

				await this.dynamodbprovider.saveRecord('roles', role);
			}
		});

	}


}

new TrialConfirmationRoleMigration().execute();
