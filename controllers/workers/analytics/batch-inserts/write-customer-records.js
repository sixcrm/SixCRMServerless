const _ = require('lodash');
const du = require('@6crm/sixcrmcore/util/debug-utilities').default;
const WriteRecords = require('./write-records');

const ATTRIBUTES = 11;

module.exports = class WriteCustomerRecords extends WriteRecords {

	constructor(auroraContext) {

		super(auroraContext);

	}

	getRecordKey(record) {

		return record.id;

	}

	write(records) {

		du.debug('WriteCustomerRecords.write()');

		if (records.length === 0) {

			du.debug('WriteCustomerRecords.write(): no records');

			return;

		}

		let query =
			'INSERT INTO analytics.d_customer ( \
				id, \
				account, \
				firstname, \
				lastname, \
				email, \
				phone, \
				city, \
				state, \
				zip, \
				created_at, \
				updated_at) \
				VALUES ';

		const values = records.map((r, i) => {

			return (`(${Array.from(new Array(ATTRIBUTES), (val, index) => (i * ATTRIBUTES) + index + 1).map(n => `$${n}`).join(',')})`);

		});

		query += values.join(',');

		query += ' \
			ON CONFLICT (id) DO UPDATE SET  \
			account = EXCLUDED.account, \
			firstname = EXCLUDED.firstname, \
			lastname = EXCLUDED.lastname, \
			email = EXCLUDED.email, \
			phone = EXCLUDED.phone, \
			city = EXCLUDED.city, \
			state = EXCLUDED.state, \
			zip = EXCLUDED.zip, \
			created_at = EXCLUDED.created_at, \
			updated_at = EXCLUDED.updated_at';

		const queryArgs = _.flatten(records.map(r => {

			return [
				r.id,
				r.account,
				r.firstname,
				r.lastname,
				r.email,
				r.phone,
				r.city,
				r.state,
				r.zip,
				r.created_at,
				r.updated_at
			];

		}));

		return this._auroraContext.withConnection(async (connection) => {

			du.debug('WriteCustomerRecords: query', query, queryArgs);

			await connection.queryWithArgs(query, queryArgs);

		});

	}

}
