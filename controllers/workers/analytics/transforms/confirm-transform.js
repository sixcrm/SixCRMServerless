const AnalyticsTransfrom = require('../analytics-transform');
const du = global.SixCRM.routes.include('lib', 'debug-utilities.js');
const moment = require('moment-timezone');

module.exports = class ConfirmTransform extends AnalyticsTransfrom {

	async transform(record) {

		du.debug('ConfirmTransform.transform()');

		let result = {
			id: record.context.id,
			account: record.context.campaign.account,
			campaign: record.context.campaign.id,
			datetime: moment.tz('UTC').toISOString(),
			type: record.event_type
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

		if (record.context.event.affiliates) {

			result = Object.assign({}, result, {
				cid: record.context.event.affiliates.cid,
				affiliate: record.context.event.affiliates.affiliate,
				subAffiliate1: record.context.event.affiliates.subaffiliate_1,
				subAffiliate2: record.context.event.affiliates.subaffiliate_2,
				subAffiliate3: record.context.event.affiliates.subaffiliate_3,
				subAffiliate4: record.context.event.affiliates.subaffiliate_4,
				subAffiliate5: record.context.event.affiliates.subaffiliate_5
			})

		}

		return Promise.resolve(result);

	}

}
