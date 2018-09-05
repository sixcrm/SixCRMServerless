const AnalyticsTransform = require('../analytics-transform');
const du = require('@6crm/sixcrmcore/util/debug-utilities').default;

module.exports = class RebillTransform extends AnalyticsTransform {

	async transform(record) {

		du.debug('RebillTransform.transform()', require('util').inspect(record, {
			showHidden: false,
			depth: null
		}));

		return {
			id: record.context.id,
			status: record.context.status
		};

	}

}
