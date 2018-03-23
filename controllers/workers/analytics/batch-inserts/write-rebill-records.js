const _ = require('underscore');
const du = global.SixCRM.routes.include('lib', 'debug-utilities.js');

const ATTRIBUTES = 6;

module.exports = class WriteRebillRecords {

	constructor(auroraContext) {

		this._auroraContext = auroraContext;

	}

	execute(records) {

		du.debug('WriteRebillRecords.execute()');

		let query =
			'INSERT INTO analytics.f_rebills ( \
				id_rebill, \
				current_queuename, \
				previous_queuename, \
				account, \
				datetime, \
				amount \
				VALUES ';

		const values = records.map((r, i) => {

			return (`(${Array.from(new Array(ATTRIBUTES), (val, index) => (i * ATTRIBUTES) + index + 1).map(n => `$${n}`).join(',')})`);

		});

		query += values.join(',');

		query += ' \
			ON CONFLICT (id_rebill, datetime) DO UPDATE SET  \
			current_queuename = EXCLUDED.current_queuename, \
			previous_queuename = EXCLUDED.previous_queuename, \
			account = EXCLUDED.account, \
			amount = EXCLUDED.amount';

		const queryArgs = _.flatten(records.map(r => {

			return [
				r.eventMeta.id_rebill,
				r.eventMeta.current_queuename,
				r.eventMeta.previous_queuename,
				r.eventMeta.account,
				r.eventMeta.datetime,
				r.eventMeta.amount
			];

		}));

		return this._auroraContext.withConnection((connection) => {

			return connection.queryWithArgs(query, queryArgs);

		});

	}

}