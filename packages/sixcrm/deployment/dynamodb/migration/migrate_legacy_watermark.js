/* eslint-disable */
require('@6crm/sixcrmcore');
const _ = require('lodash');
const querystring = require('querystring');

const du = require('@6crm/sixcrmcore/lib/util/debug-utilities').default;
const AWSDeploymentUtilities = global.SixCRM.routes.include('deployment', 'utilities/aws-deployment-utilities.js');
const DynamoDBProvider = global.SixCRM.routes.include('controllers', 'providers/dynamodb-provider.js');
const DynamoProductSchedule = require('../../../../sixcrm-product-setup/lib/scripts/data-migrations/DynamoProductSchedule.js').DynamoProductSchedule;

const scan_limit = 30000;
const batch_size = 10;

function sleep(ms){
	return new Promise(resolve=>{
		setTimeout(resolve,ms)
	})
}

class WatrmarkMigration extends AWSDeploymentUtilities {

	constructor(){

		super();

		this.dynamodbprovider = new DynamoDBProvider();
	}

	async execute() {
		let batch = [];

		console.log('Performing scan...');

		await this.dynamodbprovider.scanRecords('sessions', {limit: scan_limit}).then(async records => {
			let count = 0;
			for (let session of records.Items) {
				count++;

				if (!session.watermark) {
					continue;
				}

				if (!session.watermark.product_schedules) {
					continue;
				}

				if (!session.watermark.product_schedules.length) {
					continue;
				}

				const watermark = session.watermark;

				for (const ps of watermark.product_schedules) {
					ps.product_schedule.account_id = ps.product_schedule.account;
					ps.product_schedule.cycles = DynamoProductSchedule.cyclesFromSchedule(ps.product_schedule.schedule).map(cycle => {
						cycle.cycle_products = cycle.cycle_products.map(cp => {
							cp.product = cp.product.id;
							return cp;
						});
						return cycle;
					});

				}

				// Persist to DynamoDB

				console.log(`${count}/${records.Items.length}\t(${session.id})`);
				batch.push(this.dynamodbprovider.saveRecord('sessions', session));

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

new WatrmarkMigration().execute();
