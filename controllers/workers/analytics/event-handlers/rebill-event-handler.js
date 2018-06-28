const du = require('@6crm/sixcrmcore/util/debug-utilities').default;
const WriteRebillRecords = require('../batch-inserts/write-rebill-records')

module.exports = class RebillEventHandler {

	constructor(auroraContext) {

		this._auroraContext = auroraContext;

	}

	async execute(record) {

		du.debug('RebillEventHandler.execute()', require('util').inspect(record, {
			showHidden: false,
			depth: null
		}));

		await new WriteRebillRecords(this._auroraContext).execute([record]);

	}

}
