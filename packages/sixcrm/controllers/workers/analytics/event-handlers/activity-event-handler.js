const du = require('@6crm/sixcrmcore/util/debug-utilities').default;
const WriteActivityRecords = require('../batch-inserts/write-activity-records');

module.exports = class ActivityEventHandler {

	constructor(auroraContext) {

		this._auroraContext = auroraContext;

	}

	async execute(record) {

		du.debug('ActivityEventHandler.execute()', require('util').inspect(record, {
			showHidden: false,
			depth: null
		}));

		await new WriteActivityRecords(this._auroraContext).execute([record]);

	}

}
