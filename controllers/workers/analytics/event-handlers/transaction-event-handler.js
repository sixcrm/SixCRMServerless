const du = global.SixCRM.routes.include('lib', 'debug-utilities.js');
const WriteTransactionRecords = require('../batch-inserts/write-transaction-records')

module.exports = class TransactionEventHandler {

	constructor(auroraContext) {

		this._auroraContext = auroraContext;

	}

	execute(record) {

		du.debug('TransactionEventHandler.execute()', record);

		return Promise.resolve()
			.then(() => new WriteTransactionRecords(this._auroraContext).execute([record]));

	}

}
