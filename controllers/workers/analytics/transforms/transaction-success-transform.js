const AnalyticsTransfrom = require('../analytics-transform');
const du = global.SixCRM.routes.include('lib', 'debug-utilities.js');

module.exports = class TransactionSuccessTransform extends AnalyticsTransfrom {

	transform(record) {

		du.debug('TransactionSuccessTransform.transform()');

		return Promise.resolve({
			id: record.context.transaction.id,
			datetime: record.context.transaction.created_at,
			merchantProvider: record.context.transaction.merchant_provider,
			processorResult: record.context.transaction.result,
			amount: record.context.transaction.amount,
			type: record.event_type,
			subtype: record.transaction_subtype,
			customer: record.context.session.customer,
			creditcard: record.context.registerresponse.parameters.store.creditcard.number,
			campaign: record.context.session.campaign,
			account: record.context.session.account,
			affiliate: record.context.session.affiliate,
			subaffiliate1: record.context.session.subaffiliate_1,
			subaffiliate2: record.context.session.subaffiliate_2,
			subaffiliate3: record.context.session.subaffiliate_3,
			subaffiliate4: record.context.session.subaffiliate_4,
			subaffiliate5: record.context.session.subaffiliate_5
		});

	}

}