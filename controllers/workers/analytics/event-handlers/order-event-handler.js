const du = require('@sixcrm/sixcrmcore/util/debug-utilities').default;
const WriteEventRecords = require('../batch-inserts/write-event-records');
const WriteSessionRecords = require('../batch-inserts/write-session-records');

module.exports = class OrderEventHandler {

	constructor(auroraContext) {

		this._auroraContext = auroraContext;

	}

	async execute(record) {

		du.debug('OrderEventHandler.execute()', require('util').inspect(record, {
			showHidden: false,
			depth: null
		}));

		if (record.session) {

			await new WriteSessionRecords(this._auroraContext).execute([record.session]);

		}

		await new WriteEventRecords(this._auroraContext).execute([record]);

	}

}
