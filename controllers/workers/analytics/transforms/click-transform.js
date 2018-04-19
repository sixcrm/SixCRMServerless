const AnalyticsTransfrom = require('../analytics-transform');
const du = global.SixCRM.routes.include('lib', 'debug-utilities.js');

module.exports = class ClickTransform extends AnalyticsTransfrom {

	transform(record) {

		du.debug('ClickTransform.transform()');

		let result = {
			id: record.context.id,
			account: record.context.campaign.account,
			campaign: record.context.campaign.id,
			datetime: record.datetime,
			type: record.event_type
		};

		if (record.context.affiliates) {

			result = Object.assign({}, result, {
				cid: record.context.affiliates.cid,
				affiliate: record.context.affiliates.affiliate,
				subAffiliate1: record.context.affiliates.subaffiliate_1,
				subAffiliate2: record.context.affiliates.subaffiliate_2,
				subAffiliate3: record.context.affiliates.subaffiliate_3,
				subAffiliate4: record.context.affiliates.subaffiliate_4,
				subAffiliate5: record.context.affiliates.subaffiliate_5
			})

		}

		return Promise.resolve(result);

	}

}
