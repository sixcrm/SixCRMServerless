const _ = require('lodash');
const du = require('@6crm/sixcrmcore/util/debug-utilities').default;

const ATTRIBUTES = 6;

module.exports = class WriteRebillRecords {

	constructor(auroraContext) {

		this._auroraContext = auroraContext;

	}

	execute(records) {

		du.debug('WriteRebillRecords.execute()');

		if (records.length === 0) {

			du.debug('WriteRebillRecords.execute(): no records');

			return;

		}

		let query =
			'INSERT INTO analytics.f_rebill ( \
				id, \
				current_queuename, \
				previous_queuename, \
				account, \
				datetime, \
				amount) \
				VALUES ';

		const values = records.map((r, i) => {

			return (`(${Array.from(new Array(ATTRIBUTES), (val, index) => (i * ATTRIBUTES) + index + 1).map(n => `$${n}`).join(',')})`);

		});

		query += values.join(',');

		query += ' \
			ON CONFLICT (id, account, datetime) DO UPDATE SET  \
			current_queuename = EXCLUDED.current_queuename, \
			previous_queuename = EXCLUDED.previous_queuename, \
			amount = EXCLUDED.amount';

		const queryArgs = _.flatten(records.map(r => {

			return [
				r.id,
				r.currentQueuename,
				r.previousQueuename,
				r.account,
				r.datetime,
				r.amount
			];

		}));

		return this._auroraContext.withConnection((connection) => {

			du.debug('WriteRebillRecords: query', query, queryArgs);

			return connection.queryWithArgs(query, queryArgs);

		});

	}

}
