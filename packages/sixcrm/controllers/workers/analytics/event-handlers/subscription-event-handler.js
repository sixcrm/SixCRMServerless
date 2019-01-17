const du = require('@6crm/sixcrmcore/util/debug-utilities').default;
const WriteSubscriptionRecords = require('../batch-inserts/write-subscription-records');

module.exports = class SubscriptionEventHandler {

	constructor(auroraContext) {

		this._auroraContext = auroraContext;

	}

	async execute(record) {

		du.debug('SubscriptionEventHandler.execute()', require('util').inspect(record, {
			showHidden: false,
			depth: null
		}));

		await new WriteSubscriptionRecords(this._auroraContext).execute([record]);

	}

}
