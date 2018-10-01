const util = require('util');
const AnalyticsTransform = require('../analytics-transform');
const du = require('@6crm/sixcrmcore/util/debug-utilities').default;
const CampaignController = global.SixCRM.routes.include('entities', 'Campaign.js');
const CustomerController = global.SixCRM.routes.include('entities', 'Customer.js');

module.exports = class SubscriptionTransform extends AnalyticsTransform {

	async transform(record) {

		du.debug('SubscriptionTransform.transform()', util.inspect(record, {
			showHidden: false,
			depth: null
		}));

		const result = Object.assign({
			status: 'active'
		}, record.context);

		try {

			const campaignController = new CampaignController();
			campaignController.disableACLs();
			const response = await campaignController.get({
				id: result.campaign,
				fatal: true
			});

			result.campaign_name = response.name;

		} catch (ex) {

			du.warning('CreateOrderTransform.transform(): could not resolve campaign', ex);

		}

		try {

			const customerController = new CustomerController();
			customerController.disableACLs();
			const response = await customerController.get({
				id: result.customer,
				fatal: true
			});

			if (response.firstname && response.lastname) {

				result.customer_name = `${response.firstname} ${response.lastname}`;

			}

		} catch (ex) {

			du.warning('CreateOrderTransform.transform(): could not resolve customer', ex);

		}

		return result;

	}

}
