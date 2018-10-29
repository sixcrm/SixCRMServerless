const _ = require('lodash');
const util = require('util');
const AnalyticsTransform = require('../analytics-transform');
const du = require('@6crm/sixcrmcore/util/debug-utilities').default;
const DynamoClient = require('./entities/dynamo');

module.exports = class CreateOrderTransform extends AnalyticsTransform {

	async transform(record) {

		du.debug('CreateOrderTransform.transform()', util.inspect(record, {
			showHidden: false,
			depth: null
		}));

		const rebill = record.context.rebill;
		const result = {
			eventType: record.event_type,
			id: rebill.id,
			alias: rebill.alias,
			status: 'processed',
			datetime: rebill.created_at,
			amount: rebill.amount,
			item_count: _.sumBy(rebill.products, p => p.quantity),
			type: record.event_type === 'create_order_initial' ? 'initial' : 'recurring',
			session: rebill.parentsession
		};

		const dynamoClient = new DynamoClient();

		try {

			const response = await dynamoClient.get('sessions', result.session);

			result.session_alias = response.alias;
			result.account = response.account;
			result.campaign = response.campaign;
			result.customer = response.customer;

		} catch (ex) {

			du.warning('CreateOrderTransform.transform(): could not resolve session', ex);

		}

		try {

			const response = await dynamoClient.get('campaigns', result.campaign);

			result.campaign_name = response.name;

		} catch (ex) {

			du.warning('CreateOrderTransform.transform(): could not resolve campaign', ex);

		}

		try {

			const response = await dynamoClient.get('customers', result.customer);

			if (response.firstname && response.lastname) {

				result.customer_name = `${response.firstname} ${response.lastname}`;

			}

		} catch (ex) {

			du.warning('CreateOrderTransform.transform(): could not resolve customer', ex);

		}

		return result;

	}

}
