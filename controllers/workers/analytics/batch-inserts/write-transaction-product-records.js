const _ = require('lodash');
const du = require('@6crm/sixcrmcore/util/debug-utilities').default;
const WriteRecords = require('./write-records');

const ATTRIBUTES = 7;

module.exports = class WriteTransactionProductRecords extends WriteRecords {

	constructor(auroraContext) {

		super(auroraContext);

	}

	getRecordKey(record) {

		return `${record.transactionId}:${record.id}`;

	}

	write(records) {
		if (records.length === 0) {
			return;

		}

		let query =
			'INSERT INTO analytics.f_transaction_product ( \
				transaction_id, \
				product_id, \
				name, \
				amount, \
				quantity, \
				sku, \
				fulfillment_provider ) \
				VALUES ';

		const values = records.map((r, i) => {

			return (`(${Array.from(new Array(ATTRIBUTES), (val, index) => (i * ATTRIBUTES) + index + 1).map(n => `$${n}`).join(',')})`);

		});

		query += values.join(',');

		query += ' \
			ON CONFLICT (transaction_id, product_id) DO UPDATE SET  \
			name = EXCLUDED.name, \
			amount = EXCLUDED.amount, \
			quantity = EXCLUDED.quantity, \
			sku = EXCLUDED.sku, \
			fulfillment_provider = EXCLUDED.fulfillment_provider';

		const queryArgs = _.flatten(records.map(r => {

			return [
				r.transactionId,
				r.id,
				r.name,
				r.amount,
				r.quantity,
				r.sku,
				r.fulfillmentProvider
			];

		}));

		return this._auroraContext.withConnection((connection) => {

			du.debug('WriteTransactionProductRecords: query', query, queryArgs);

			return connection.queryWithArgs(query, queryArgs);

		});

	}

}
