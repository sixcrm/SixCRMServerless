const AnalyticsTransfrom = require('../analytics-transform');
const du = global.SixCRM.routes.include('lib', 'debug-utilities.js');

module.exports = class ConfirmTransform extends AnalyticsTransfrom {

	transform(record) {

		du.debug('ConfirmTransform.transform()');

		let result = {
			account: record.context.campaign.account,
			campaign: record.context.campaign.id,
			datetime: record.context.session.updated_at,
			session: record.context.session.id,
			type: record.event_type
		};

		if (record.context.event.affiliates) {

			result = Object.assign({}, result, {
				cid: record.context.event.affiliates.cid,
				affiliate: record.context.event.affiliates.affiliate,
				subaffiliate1: record.context.event.affiliates.subaffiliate_1,
				subaffiliate2: record.context.event.affiliates.subaffiliate_2,
				subaffiliate3: record.context.event.affiliates.subaffiliate_3,
				subaffiliate4: record.context.event.affiliates.subaffiliate_4,
				subaffiliate5: record.context.event.affiliates.subaffiliate_5
			})

		}

		return Promise.resolve(result);

	}

}