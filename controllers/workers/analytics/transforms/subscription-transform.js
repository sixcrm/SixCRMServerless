const util = require('util');
const AnalyticsTransform = require('../analytics-transform');
const du = require('@6crm/sixcrmcore/util/debug-utilities').default;
const DynamoClient = require('./entities/dynamo');

module.exports = class SubscriptionTransform extends AnalyticsTransform {

	async transform(record) {

		du.debug('SubscriptionTransform.transform()', util.inspect(record, {
			showHidden: false,
			depth: null
		}));

		const result = Object.assign({
			status: 'active'
		}, record.context);

		const dynamoClient = new DynamoClient();
		try {

			const campaign = await dynamoClient.get('campaigns', result.campaign);
			result.campaign_name = campaign.name;

		} catch (ex) {

			du.warning('SubscriptionTransform.transform(): could not resolve campaign', ex);

		}

		try {

			const customer = await dynamoClient.get('customers', result.customer);
			if (customer.firstname && customer.lastname) {

				result.customer_name = `${customer.firstname} ${customer.lastname}`;

			}

		} catch (ex) {

			du.warning('SubscriptionTransform.transform(): could not resolve customer', ex);

		}

		return result;

	}

}
