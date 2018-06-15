const AnalyticsTransfrom = require('../analytics-transform');
const du = require('@sixcrm/sixcrmcore/util/debug-utilities').default;

module.exports = class ClickTransform extends AnalyticsTransfrom {

	async transform(record) {

		du.debug('ClickTransform.transform()', require('util').inspect(record, {
			showHidden: false,
			depth: null
		}));

		let result = {
			id: record.context.id,
			account: record.context.campaign.account,
			campaign: record.context.campaign.id,
			datetime: record.context.datetime,
			eventType: record.event_type
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

		return result;

	}

}
