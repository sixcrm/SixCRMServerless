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
