const du = require('@6crm/sixcrmcore/util/debug-utilities').default;
const CancelSessionRecords = require('../batch-inserts/cancel-session-records');

module.exports = class CancelSessionEventHandler {

	constructor(auroraContext) {

		this._auroraContext = auroraContext;

	}

	async execute(record) {

		du.debug('CancelSessionEventHandler.execute()', require('util').inspect(record, {
			showHidden: false,
			depth: null
		}));

		await new CancelSessionRecords(this._auroraContext).execute([record]);

	}

}
