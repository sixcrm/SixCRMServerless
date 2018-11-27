const util = require('util');
const moment = require('moment-timezone');
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

		const datetime = moment(result.datetime).utc();
		if (result.interval === 'monthly') {

			result.datetime = datetime.add(1, 'months').format();

		}
		else {

			const days = result.interval.substring(0, result.interval.indexOf(' '));
			result.datetime = datetime.add(days, 'days').format();

		}

		const dynamoClient = new DynamoClient();
		try {

			const campaign = await dynamoClient.get('campaigns', result.campaign);
			result.campaign_name = campaign.name;

		} catch (ex) {

			du.warning('SubscriptionTransform.transform(): could not resolve campaign', ex);

		}

		try {

			const merchant_provider = await dynamoClient.get('merchantproviders', result.merchant_provider);
			result.merchant_provider_name = merchant_provider.name;

		} catch (ex) {

			du.warning('SubscriptionTransform.transform(): could not resolve customer', ex);

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
