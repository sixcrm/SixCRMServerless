const du = require('@6crm/sixcrmcore/util/debug-utilities').default;
const WriteRebillRecords = require('../batch-inserts/write-rebill-records');

module.exports = class CreateOrderEventHandler {

	constructor(auroraContext) {

		this._auroraContext = auroraContext;

	}

	async execute(record) {

		du.warning('CreateOrderEventHandler.execute()', require('util').inspect(record, {
			showHidden: false,
			depth: null
		}));

		await new WriteRebillRecords(this._auroraContext).execute([record]);

	}

}
