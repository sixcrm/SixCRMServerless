const AnalyticsTransfrom = require('../analytics-transform');
const du = global.SixCRM.routes.include('lib', 'debug-utilities.js');

module.exports = class OrderTransform extends AnalyticsTransfrom {

	transform(record) {

		du.debug('OrderTransform.transform()');

		return Promise.resolve({
			affiliate: record.context.session.affiliate,
			account: record.context.campaign.account,
			campaign: record.context.campaign.id,
			cid: record.context.session.cid,
			datetime: record.context.session.updated_at,
			session: record.context.session.id,
			subaffiliate1: record.context.session.subaffiliate_1,
			subaffiliate2: record.context.session.subaffiliate_2,
			subaffiliate3: record.context.session.subaffiliate_3,
			subaffiliate4: record.context.session.subaffiliate_4,
			subaffiliate5: record.context.session.subaffiliate_5,
			type: record.event_type
		});

	}

}