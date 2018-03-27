const du = global.SixCRM.routes.include('lib', 'debug-utilities.js');

module.exports = class TransactionSuccessTransform {

	execute(record) {

		du.debug('TransactionSuccessTransform.execute()');

		return Promise.resolve(
			record.context.registerresponse.parameters.store.transactions.map(t => {
				return {
					id: t.id,
					datetime: t.created_at,
					merchantProvider: t.merchant_provider,
					processorResult: t.result,
					amount: t.amount,
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
					subaffiliate5: record.context.session.subaffiliate_5,
				};
			}));

	}

}
