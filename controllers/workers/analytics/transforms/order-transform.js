const du = global.SixCRM.routes.include('lib', 'debug-utilities.js');

module.exports = class OrderTransform {

	execute(record) {

		du.debug('OrderTransform.execute()');

		return Promise.resolve({
			affiliate: record.context.session.affiliate,
			account: record.context.campaign.account,
			campaign: record.context.campaign.id,
			cid: record.context.session.cid,
			datetime: record.context.session.updated_at,
			session: record.context.session.id,
			subaffiliate_1: record.context.session.subaffiliate_1,
			subaffiliate_2: record.context.session.subaffiliate_2,
			subaffiliate_3: record.context.session.subaffiliate_3,
			subaffiliate_4: record.context.session.subaffiliate_4,
			subaffiliate_5: record.context.session.subaffiliate_5,
			type: record.event_type
		});

	}

}