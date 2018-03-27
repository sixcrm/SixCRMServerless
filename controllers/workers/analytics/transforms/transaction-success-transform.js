const du = global.SixCRM.routes.include('lib', 'debug-utilities.js');

module.exports = class TransactionSuccessTransform {

	execute(record) {

		du.debug('TransactionSuccessTransform.execute()');

		return Promise.resolve({
			datetime: record.context.registerresponse.parameters.store.transactions[0].created_at,
			type: record.event_type
		});

	}

}

// 'INSERT INTO analytics.f_transactions ( \
// 	id, \
// 	datetime, \
// 	customer, \
// 	creditcard, \
// 	merchant_provider, \
// 	campaign, \
// 	affiliate, \
// 	amount, \
// 	processor_result, \
// 	account, \
// 	type, \
// 	subtype, \
// 	product_schedule, \
// 	subaffiliate_1, \
// 	subaffiliate_2, \
// 	subaffiliate_3, \
// 	subaffiliate_4, \
// 	subaffiliate_5) \
// 	VALUES ';
