const du = global.SixCRM.routes.include('lib', 'debug-utilities.js');
const WriteTransactionRecords = require('../batch-inserts/write-transaction-records');
const WriteTransactionProductRecords = require('../batch-inserts/write-transaction-product-records');

module.exports = class TransactionEventHandler {

	constructor(auroraContext) {

		this._auroraContext = auroraContext;

	}

	async execute(record) {

		du.debug('TransactionEventHandler.execute()', record);

		await new WriteTransactionRecords(this._auroraContext).execute([record]);
		await new WriteTransactionProductRecords(this._auroraContext).execute(record.id, record.products);

	}

}
