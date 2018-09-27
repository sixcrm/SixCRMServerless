const util = require('util');
const AnalyticsTransform = require('../analytics-transform');
const du = require('@6crm/sixcrmcore/util/debug-utilities').default;

module.exports = class SubscriptionTransform extends AnalyticsTransform {

	async transform(record) {

		du.debug('CancelSessionTransform.transform()', util.inspect(record, {
			showHidden: false,
			depth: null
		}));

		return record.context;

	}

}
