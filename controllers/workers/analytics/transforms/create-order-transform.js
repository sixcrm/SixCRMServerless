const _ = require('lodash');
const util = require('util');
const AnalyticsTransform = require('../analytics-transform');
const du = require('@6crm/sixcrmcore/util/debug-utilities').default;
const CampaignController = global.SixCRM.routes.include('entities', 'Campaign.js');
const CustomerController = global.SixCRM.routes.include('entities', 'Customer.js');
const SessionController = global.SixCRM.routes.include('entities', 'Session.js');

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

		try {

			const sessionController = new SessionController();
			sessionController.disableACLs();
			const response = await sessionController.get({
				id: result.session,
				fatal: true
			});

			result.session_alias = response.alias;
			result.account = response.account;
			result.campaign = response.campaign;
			result.customer = response.customer;

		} catch (ex) {

			du.warning('CreateOrderTransform.transform(): could not resolve session', ex);

		}

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
