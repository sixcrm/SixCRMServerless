const AnalyticsTransfrom = require('../analytics-transform');
const du = global.SixCRM.routes.include('lib', 'debug-utilities.js');

module.exports = class ChargebackTransform extends AnalyticsTransfrom {

	async transform(record) {

		du.debug('ChargebackTransform.transform()', require('util').inspect(record, {
			showHidden: false,
			depth: null
		}));

		return {
			eventType: record.event_type,
			id: record.context.transaction.id,
			datetime: record.context.transaction.updated_at
		};

	}

}
