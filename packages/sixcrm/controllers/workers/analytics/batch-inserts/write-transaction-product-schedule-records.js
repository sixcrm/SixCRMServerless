const _ = require('lodash');
const du = require('@6crm/sixcrmcore/util/debug-utilities').default;
const WriteRecords = require('./write-records');

const ATTRIBUTES = 4;

module.exports = class WriteTransactionProductScheduleRecords extends WriteRecords {

	constructor(auroraContext) {

		super(auroraContext);

	}

	getRecordKey(record) {

		return `${record.transactionId}:${record.id}:${record.productId}`;

	}

	write(records) {
		if (records.length === 0) {
			return;

		}

		let query =
			'INSERT INTO analytics.f_transaction_product_schedule ( \
				transaction_id, \
				product_schedule_id, \
				product_id, \
				product_schedule_name) \
				VALUES ';

		const values = records.map((r, i) => {

			return (`(${Array.from(new Array(ATTRIBUTES), (val, index) => (i * ATTRIBUTES) + index + 1).map(n => `$${n}`).join(',')})`);

		});

		query += values.join(',');

		query += ' \
			ON CONFLICT (transaction_id, product_schedule_id, product_id) DO NOTHING';

		const queryArgs = _.flatten(records.map(r => {

			return [
				r.transactionId,
				r.id,
				r.productId,
				r.name
			];

		}));

		return this._auroraContext.withConnection((connection) => {

			du.debug('WriteTransactionProductScheduleRecords: query', query, queryArgs);

			return connection.queryWithArgs(query, queryArgs);

		});

	}

}
