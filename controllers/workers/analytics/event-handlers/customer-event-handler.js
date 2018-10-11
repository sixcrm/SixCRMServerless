const du = require('@6crm/sixcrmcore/util/debug-utilities').default;
const WriteCustomerRecords = require('../batch-inserts/write-customer-records');

module.exports = class CustomerEventHandler {

	constructor(auroraContext) {

		this._auroraContext = auroraContext;

	}

	async execute(record) {

		du.debug('CustomerEventHandler.execute()', require('util').inspect(record, {
			showHidden: false,
			depth: null
		}));

		await new WriteCustomerRecords(this._auroraContext).execute([record]);

	}

}
