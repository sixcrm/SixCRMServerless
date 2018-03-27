const du = global.SixCRM.routes.include('lib', 'debug-utilities.js');

module.exports = class ConfirmTransform {

	execute(record) {

		du.debug('ConfirmTransform.execute()');

		return Promise.resolve({
			affiliate: record.context.event.affiliates.affiliate,
			account: record.context.campaign.account,
			campaign: record.context.campaign.id,
			cid: record.context.event.affiliates.cid,
			datetime: record.context.session.updated_at,
			session: record.context.session.id,
			subaffiliate1: record.context.event.affiliates.subaffiliate_1,
			subaffiliate2: record.context.event.affiliates.subaffiliate_2,
			subaffiliate3: record.context.event.affiliates.subaffiliate_3,
			subaffiliate4: record.context.event.affiliates.subaffiliate_4,
			subaffiliate5: record.context.event.affiliates.subaffiliate_5,
			type: record.event_type
		});

	}

}