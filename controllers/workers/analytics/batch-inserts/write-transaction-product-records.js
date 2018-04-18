const _ = require('lodash');
const du = global.SixCRM.routes.include('lib', 'debug-utilities.js');

const ATTRIBUTES = 7;

module.exports = class WriteTransactionProductRecords {

	constructor(auroraContext) {

		this._auroraContext = auroraContext;

	}

	execute(transactionId, records) {

		du.debug('WriteTransactionProductRecords.execute()');

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
				transactionId,
				r.id,
				r.name,
				r.amount,
				r.quantity,
				r.sku,
				r.fulfillmentProvider
			];

		}));

		return this._auroraContext.withConnection((connection) => {

			return connection.queryWithArgs(query, queryArgs);

		});

	}

}
