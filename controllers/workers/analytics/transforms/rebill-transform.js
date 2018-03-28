const AnalyticsTransfrom = require('../analytics-transform');
const du = global.SixCRM.routes.include('lib', 'debug-utilities.js');

module.exports = class RebillTransform extends AnalyticsTransfrom {

	transform(record) {

		du.debug('RebillTransform.transform()');

		return Promise.resolve({
			id: record.context.transformedrebill.id_rebill,
			datetime: record.context.transformedrebill.datetime,
			currentQueuename: record.context.transformedrebill.current_queuename,
			previousQueuename: record.context.transformedrebill.previous_queuename,
			account: record.context.transformedrebill.account,
			amount: record.context.transformedrebill.amount,
			type: record.event_type
		});

	}

}
