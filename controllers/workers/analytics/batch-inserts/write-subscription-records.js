const _ = require('lodash');
const du = require('@6crm/sixcrmcore/util/debug-utilities').default;
const WriteRecords = require('./write-records');

const ATTRIBUTES = 15;

module.exports = class WriteSubscriptionRecords extends WriteRecords {

	constructor(auroraContext) {

		super(auroraContext);

	}

	getRecordKey(record) {

		return record.id;

	}

	write(records) {

		du.debug('WriteSubscriptionRecords.write()');

		if (records.length === 0) {

			du.debug('WriteSubscriptionRecords.write(): no records');

			return;

		}

		let inactiveQuery = `
			UPDATE analytics.f_subscription
			SET status = 'inactive'
			WHERE status = 'active' AND session IN `;

		const inClause = records.map((r, i) => `$${i + 1}`).join(',');
		inactiveQuery += `(${inClause});`;
		const inactiveQueryArgs = records.map(r => r.session);

		let query =
			'INSERT INTO analytics.f_subscription ( \
				id, \
				alias, \
				datetime, \
				status, \
				amount, \
				item_count, \
				cycle, \
				interval, \
				account, \
				session, \
				session_alias, \
				campaign, \
				campaign_name, \
				customer, \
				customer_name) \
				VALUES ';

		const values = records.map((r, i) => {

			return (`(${Array.from(new Array(ATTRIBUTES), (val, index) => (i * ATTRIBUTES) + index + 1).map(n => `$${n}`).join(',')})`);

		});

		query += values.join(',');

		query += ' \
			ON CONFLICT (id) DO UPDATE SET  \
			alias = EXCLUDED.alias, \
			datetime = EXCLUDED.datetime, \
			status = EXCLUDED.status, \
			amount = EXCLUDED.amount, \
			item_count = EXCLUDED.item_count, \
			cycle = EXCLUDED.cycle, \
			interval = EXCLUDED.interval, \
			account = EXCLUDED.account, \
			session = EXCLUDED.session, \
			session_alias = EXCLUDED.session_alias, \
			campaign = EXCLUDED.campaign, \
			campaign_name = EXCLUDED.campaign_name, \
			customer = EXCLUDED.customer, \
			customer_name = EXCLUDED.customer_name';

		const queryArgs = _.flatten(records.map(r => {

			return [
				r.id,
				r.alias,
				r.datetime,
				r.status,
				r.amount,
				r.item_count,
				r.cycle,
				r.interval,
				r.account,
				r.session,
				r.session_alias,
				r.campaign,
				r.campaign_name,
				r.customer,
				r.customer_name
			];

		}));

		return this._auroraContext.withConnection(async (connection) => {

			du.debug('WriteSubscriptionRecords: inactiveQuery', inactiveQuery, inactiveQueryArgs);

			await connection.queryWithArgs(inactiveQuery, inactiveQueryArgs);

			du.debug('WriteSubscriptionRecords: query', query, queryArgs);

			await connection.queryWithArgs(query, queryArgs);

		});

	}

}
