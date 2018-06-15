const AnalyticsTransfrom = require('../analytics-transform');
const du = require('@sixcrm/sixcrmcore/util/debug-utilities').default;

module.exports = class OrderTransform extends AnalyticsTransfrom {

	async transform(record) {

		du.debug('OrderTransform.transform()', require('util').inspect(record, {
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

		if (record.context.session) {

			Object.assign(result, {
				datetime: record.context.session.updated_at,
				session: {
					id: record.context.session.id,
					datetime: record.context.session.created_at,
					account: record.context.session.account,
					campaign: record.context.session.campaign,
					cid: record.context.session.cid,
					affiliate: record.context.session.affiliate,
					subAffiliate1: record.context.session.subaffiliate_1,
					subAffiliate2: record.context.session.subaffiliate_2,
					subAffiliate3: record.context.session.subaffiliate_3,
					subAffiliate4: record.context.session.subaffiliate_4,
					subAffiliate5: record.context.session.subaffiliate_5
				}
			});

		}

		return result;

	}

}
