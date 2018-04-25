const du = global.SixCRM.routes.include('lib', 'debug-utilities.js');
const WriteChargebackRecords = require('../batch-inserts/write-chargeback-records');

module.exports = class ChargebackEventHandler {

	constructor(auroraContext) {

		this._auroraContext = auroraContext;

	}

	async execute(record) {

		du.debug('ChargebackEventHandler.execute()', record);

		await new WriteChargebackRecords(this._auroraContext).execute([record]);

	}

}
