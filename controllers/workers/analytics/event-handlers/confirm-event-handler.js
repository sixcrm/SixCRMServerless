const du = global.SixCRM.routes.include('lib', 'debug-utilities.js');
const WriteEventRecords = require('../batch-inserts/write-event-records');
const WriteSessionRecords = require('../batch-inserts/write-session-records');

module.exports = class ConfirmEventHandler {

	constructor(auroraContext) {

		this._auroraContext = auroraContext;

	}

	async execute(record) {

		du.debug('ConfirmEventHandler.execute()', require('util').inspect(record, {
			showHidden: false,
			depth: null
		}));

		if (record.session) {

			await new WriteSessionRecords(this._auroraContext).execute([record.session]);

		}

		await new WriteEventRecords(this._auroraContext).execute([record]);

	}

}
