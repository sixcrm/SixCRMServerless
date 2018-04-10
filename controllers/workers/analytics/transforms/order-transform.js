const AnalyticsTransfrom = require('../analytics-transform');
const du = global.SixCRM.routes.include('lib', 'debug-utilities.js');

module.exports = class OrderTransform extends AnalyticsTransfrom {

	transform(record) {

		du.debug('OrderTransform.transform()');

		let result = {
			id: record.context.id,
			account: record.context.campaign.account,
			campaign: record.context.campaign.id,
			datetime: record.context.session.updated_at,
			session: record.context.session.id,
			type: record.event_type
		};

		if (record.context.session) {

			result = Object.assign({}, result, {
				cid: record.context.session.cid,
				affiliate: record.context.session.affiliate,
				subaffiliate1: record.context.session.subaffiliate_1,
				subaffiliate2: record.context.session.subaffiliate_2,
				subaffiliate3: record.context.session.subaffiliate_3,
				subaffiliate4: record.context.session.subaffiliate_4,
				subaffiliate5: record.context.session.subaffiliate_5
			})

		}

		return Promise.resolve(result);

	}

}