const _ = require('lodash');
const du = require('@6crm/sixcrmcore/util/debug-utilities').default;

const ATTRIBUTES = 2;

module.exports = class WriteChargebackRecords {

	constructor(auroraContext) {

		this._auroraContext = auroraContext;

	}

	execute(records) {

		du.debug('WriteChargebackRecords.execute()');

		if (records.length === 0) {

			du.debug('WriteChargebackRecords.execute(): no records');

			return;

		}

		let query =
			'INSERT INTO analytics.f_transaction_chargeback ( \
				transaction_id, \
				datetime) \
				VALUES ';

		const values = records.map((r, i) => {

			return (`(${Array.from(new Array(ATTRIBUTES), (val, index) => (i * ATTRIBUTES) + index + 1).map(n => `$${n}`).join(',')})`);

		});

		query += values.join(',');

		query += ' \
			ON CONFLICT (transaction_id) DO UPDATE SET  \
			datetime = EXCLUDED.datetime';

		const queryArgs = _.flatten(records.map(r => {

			return [
				r.id,
				r.datetime,
			];

		}));

		return this._auroraContext.withConnection((connection) => {

			du.debug('WriteChargebackRecords: query', query, queryArgs);

			return connection.queryWithArgs(query, queryArgs);

		});

	}

}
