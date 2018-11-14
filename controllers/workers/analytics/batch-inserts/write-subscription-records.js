const _ = require('lodash');
const du = require('@6crm/sixcrmcore/util/debug-utilities').default;
const WriteRecords = require('./write-records');

const ATTRIBUTES = 19;

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

		let updateQuery = records.map((r, i) => `
			UPDATE analytics.f_subscription SET
				status = $${7*i + 1},
				cycle = $${7*i + 2},
				merchant_provider = $${7*i + 3},
				merchant_provider_name = $${7*i + 4}
			WHERE session_id = $${7*i + 5} AND product_schedule_id = $${7*i + 6} AND product_id = $${7*i + 7}`).join(';');
		const updateQueryArgs = _.flatten(records.map(r =>
			[r.status, r.cycle, r.merchant_provider, r.merchant_provider_name, r.session_id, r.product_schedule_id, r.product_id]));

		let query =
			'INSERT INTO analytics.f_subscription ( \
				session_id, \
				product_schedule_id, \
				product_id, \
				session_alias, \
				product_schedule_name, \
				product_name, \
				datetime, \
				status, \
				amount, \
				item_count, \
				cycle, \
				interval, \
				account, \
				campaign, \
				campaign_name, \
				merchant_provider_name,\
				merchant_provider, \
				customer, \
				customer_name) \
				VALUES ';

		const values = records.map((r, i) => {

			return (`(${Array.from(new Array(ATTRIBUTES), (val, index) => (i * ATTRIBUTES) + index + 1).map(n => `$${n}`).join(',')})`);

		});

		query += values.join(',');

		query += ' ON CONFLICT (session_id, product_schedule_id, product_id) DO NOTHING';

		const queryArgs = _.flatten(records.map(r => {

			return [
				r.session_id,
				r.product_schedule_id,
				r.product_id,
				r.session_alias,
				r.product_schedule_name,
				r.product_name,
				r.datetime,
				r.status,
				r.amount,
				r.item_count,
				r.cycle,
				r.interval,
				r.account,
				r.campaign,
				r.campaign_name,
				r.merchant_provider_name,
				r.merchant_provider,
				r.customer,
				r.customer_name
			];

		}));

		return this._auroraContext.withConnection(async (connection) => {

			du.debug('WriteSubscriptionRecords: updateQuery', updateQuery, updateQueryArgs);

			await connection.queryWithArgs(updateQuery, updateQueryArgs);

			du.debug('WriteSubscriptionRecords: query', query, queryArgs);

			await connection.queryWithArgs(query, queryArgs);

		});

	}

}
