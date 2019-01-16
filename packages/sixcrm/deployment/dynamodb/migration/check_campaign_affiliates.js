/* eslint-disable */
require('@6crm/sixcrmcore');

const AWSDeploymentUtilities = global.SixCRM.routes.include('deployment', 'utilities/aws-deployment-utilities.js');
const DynamoDBProvider = global.SixCRM.routes.include('controllers', 'providers/dynamodb-provider.js');

const scan_limit = 30000;



class AffiliateMigration extends AWSDeploymentUtilities {

	constructor(){

		super();

		this.dynamodbprovider = new DynamoDBProvider();
	}

	async execute() {
		console.log('Performing scan...');

		await this.dynamodbprovider.scanRecords('campaigns', {limit: scan_limit}).then(async records => {
			let count = 0;
			for (let campaign of records.Items) {
				count++;

				if (!campaign.affiliate_allow || !campaign.affiliate_deny) {
					continue;
				}

				const affiliate_intersection = campaign.affiliate_allow
					.filter(allow => campaign.affiliate_deny.includes(allow))
					.filter(affiliate => affiliate !== '*');

				if (affiliate_intersection.length) {
					console.log(campaign.id, campaign.name, affiliate_intersection)
				}

			}
			console.log('Total', records.Items.length);

		});

	}


}

new AffiliateMigration().execute();
