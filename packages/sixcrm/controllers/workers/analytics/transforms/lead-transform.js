const AnalyticsTransform = require('../analytics-transform');
const du = require('@6crm/sixcrmcore/util/debug-utilities').default;

module.exports = class LeadTransform extends AnalyticsTransform {

	async transform(record) {

		du.debug('LeadTransform.transform()', require('util').inspect(record, {
			showHidden: false,
			depth: null
		}));

		let result = {
			id: record.context.id,
			account: record.context.campaign.account,
			campaign: record.context.campaign.id,
			datetime: record.context.datetime,
			eventType: record.event_type,
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
