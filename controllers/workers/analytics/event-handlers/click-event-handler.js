const du = require('@sixcrm/sixcrmcore/util/debug-utilities').default;
const WriteEventRecords = require('../batch-inserts/write-event-records');

module.exports = class ClickEventHandler {

	constructor(auroraContext) {

		this._auroraContext = auroraContext;

	}

	async execute(record) {

		du.debug('ClickEventHandler.execute()', require('util').inspect(record, {
			showHidden: false,
			depth: null
		}));

		await new WriteEventRecords(this._auroraContext).execute([record]);

	}

}
