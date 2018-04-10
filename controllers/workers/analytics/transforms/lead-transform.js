const AnalyticsTransfrom = require('../analytics-transform');
const du = global.SixCRM.routes.include('lib', 'debug-utilities.js');

module.exports = class LeadTransform extends AnalyticsTransfrom {

	transform(record) {

		du.debug('LeadTransform.transform()');

		let result = {
			id: record.context.id,
			account: record.context.campaign.account,
			campaign: record.context.campaign.id,
			datetime: record.context.session.updated_at,
			session: record.context.session.id,
			type: record.event_type
		};

		if (record.context.affiliates) {

			result = Object.assign({}, result, {
				cid: record.context.affiliates.cid,
				affiliate: record.context.affiliates.affiliate,
				subaffiliate1: record.context.affiliates.subaffiliate_1,
				subaffiliate2: record.context.affiliates.subaffiliate_2,
				subaffiliate3: record.context.affiliates.subaffiliate_3,
				subaffiliate4: record.context.affiliates.subaffiliate_4,
				subaffiliate5: record.context.affiliates.subaffiliate_5
			})

		}

		return Promise.resolve(result);

	}

}