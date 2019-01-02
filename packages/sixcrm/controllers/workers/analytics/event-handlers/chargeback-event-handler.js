const du = require('@6crm/sixcrmcore/util/debug-utilities').default;
const WriteChargebackRecords = require('../batch-inserts/write-chargeback-records');

module.exports = class ChargebackEventHandler {

	constructor(auroraContext) {

		this._auroraContext = auroraContext;

	}

	async execute(record) {

		du.debug('ChargebackEventHandler.execute()', require('util').inspect(record, {
			showHidden: false,
			depth: null
		}));

		await new WriteChargebackRecords(this._auroraContext).execute([record]);

	}

}
