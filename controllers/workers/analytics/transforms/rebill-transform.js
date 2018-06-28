const AnalyticsTransfrom = require('../analytics-transform');
const du = require('@6crm/sixcrmcore/util/debug-utilities').default;

module.exports = class RebillTransform extends AnalyticsTransfrom {

	async transform(record) {

		du.debug('RebillTransform.transform()', require('util').inspect(record, {
			showHidden: false,
			depth: null
		}));

		return {
			id: record.context.transformedrebill.id,
			datetime: record.context.transformedrebill.datetime,
			currentQueuename: record.context.transformedrebill.current_queuename,
			previousQueuename: record.context.transformedrebill.previous_queuename,
			account: record.context.transformedrebill.account,
			amount: record.context.transformedrebill.amount,
			eventType: record.event_type
		};

	}

}
