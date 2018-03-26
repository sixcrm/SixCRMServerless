const du = global.SixCRM.routes.include('lib', 'debug-utilities.js');

module.exports = class ClickTransform {

	execute(record) {

		du.debug('ClickTransform.execute()');

		return Promise.resolve({
			affiliate: record.context.affiliates.affiliate,
			account: record.context.campaign.account,
			campaign: record.context.campaign.id,
			cid: record.context.affiliates.cid,
			datetime: record.context.session.updated_at,
			session: record.context.session.id,
			subaffiliate_1: record.context.affiliates.subaffiliate_1,
			subaffiliate_2: record.context.affiliates.subaffiliate_2,
			subaffiliate_3: record.context.affiliates.subaffiliate_3,
			subaffiliate_4: record.context.affiliates.subaffiliate_4,
			subaffiliate_5: record.context.affiliates.subaffiliate_5,
			type: record.event_type
		});

	}

}