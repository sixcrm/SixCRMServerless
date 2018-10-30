const _ = require('lodash');
const du = require('@6crm/sixcrmcore/util/debug-utilities').default;
const WriteRecords = require('./write-records');

const ATTRIBUTES = 21;

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

		let inactiveQuery = records.map((r, i) => `
			UPDATE analytics.f_subscription
			SET status = 'inactive'
			WHERE status = 'active' AND product_schedule_id = ${2*i + 1} AND session = ${2*i + 2}`).join(';');
		const inactiveQueryArgs = _.flatten(records.map(r => [r.product_schedule, r.session]));

		let query =
			'INSERT INTO analytics.f_subscription ( \
				rebill_id, \
				product_schedule_id, \
				rebill_alias, \
				product_schedule_name, \
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
				product_schedule_name,\
				product_schedule,\
				merchant_provider_name,\
				merchant_provider, \
				customer, \
				customer_name) \
				VALUES ';

		const values = records.map((r, i) => {

			return (`(${Array.from(new Array(ATTRIBUTES), (val, index) => (i * ATTRIBUTES) + index + 1).map(n => `$${n}`).join(',')})`);

		});

		query += values.join(',');

		query += ' \
			ON CONFLICT (rebill_id, product_schedule_id) DO UPDATE SET  \
			rebill_alias = EXCLUDED.alias, \
			product_schedule_name = EXCLUDED.product_schedule_name, \
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
			product_schedule_name = EXCLUDED.product_schedule_name, \
			product_schedule = EXCLUDED.product_schedule, \
			merchant_provider_name = EXCLUDED.merchant_provider_name, \
			merchant_provider = EXCLUDED.merchant_provider, \
			customer = EXCLUDED.customer, \
			customer_name = EXCLUDED.customer_name';

		const queryArgs = _.flatten(records.map(r => {

			return [
				r.rebill_id,
				r.product_schedule_id,
				r.rebill_alias,
				r.product_schedule_name,
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
				r.product_schedule_name,
				r.product_schedule,
				r.merchant_provider_name,
				r.merchant_provider,
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
