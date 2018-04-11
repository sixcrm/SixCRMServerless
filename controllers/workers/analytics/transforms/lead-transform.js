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
			type: record.event_type,
			session: {
				id: record.context.session.id,
				datetime: record.context.session.created_at,
				account: record.context.session.account,
				campaign: record.context.session.campaign,
				cid: record.context.session.cid,
				affiliate: record.context.session.affiliate,
				subaffiliate_1: record.context.session.subaffiliate_1,
				subaffiliate_2: record.context.session.subaffiliate_2,
				subaffiliate_3: record.context.session.subaffiliate_3,
				subaffiliate_4: record.context.session.subaffiliate_4,
				subaffiliate_5: record.context.session.subaffiliate_5
			}
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