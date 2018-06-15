const du = require('@sixcrm/sixcrmcore/util/debug-utilities').default;
const WriteTransactionRecords = require('../batch-inserts/write-transaction-records');
const WriteTransactionProductRecords = require('../batch-inserts/write-transaction-product-records');
const WriteTransactionProductScheduleRecords = require('../batch-inserts/write-transaction-product-schedule-records');
const WriteSessionRecords = require('../batch-inserts/write-session-records');
const BBPromise = require('bluebird');

module.exports = class TransactionEventHandler {

	constructor(auroraContext) {

		this._auroraContext = auroraContext;

	}

	async execute(record) {

		du.debug('TransactionEventHandler.execute()', require('util').inspect(record, {
			showHidden: false,
			depth: null
		}));

		await new WriteSessionRecords(this._auroraContext).execute([record.session]);
		await new WriteTransactionRecords(this._auroraContext).execute([record]);
		await new WriteTransactionProductRecords(this._auroraContext).execute(record.id, record.products);

		await BBPromise.each(record.products, (p => {

			return new WriteTransactionProductScheduleRecords(this._auroraContext).execute(record.id, p.id, p.productSchedules);

		}));

	}

}
