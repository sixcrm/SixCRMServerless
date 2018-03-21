const _ = require('underscore')
const AnalyticsEventHandler = require('./AnalyticsEventHandler');
const du = global.SixCRM.routes.include('lib', 'debug-utilities.js');

module.exports = class WriteTransactionRecords extends AnalyticsEventHandler {

	constructor(auroraContext) {

		super('rds_transaction_batch', auroraContext);

	}

	executeBatchWriteQuery(records) {

		du.debug('WriteTransactionRecords.executeBatchWriteQuery()');

		let query =
			'INSERT INTO analytics.f_transactions ( \
				id, \
				datetime, \
				customer, \
				creditcard, \
				merchant_provider, \
				campaign, \
				affiliate, \
				amount, \
				processor_result, \
				account, \
				type, \
				subtype, \
				product_schedule, \
				subaffiliate_1, \
				subaffiliate_2, \
				subaffiliate_3, \
				subaffiliate_4, \
				subaffiliate_5) \
				VALUES ';

		const values = records.map((r, i) => {

			return (`(${Array.from(new Array(18), (val, index) => (i * 18) + index + 1).map(n => `$${n}`).join(',')})`);

		});

		query += values.join(',');

		query += ' \
			ON CONFLICT (id) DO UPDATE SET  \
			datetime = EXCLUDED.datetime, \
			customer = EXCLUDED.customer, \
			creditcard = EXCLUDED.creditcard, \
			merchant_provider = EXCLUDED.merchant_provider, \
			campaign = EXCLUDED.campaign, \
			affiliate = EXCLUDED.affiliate, \
			amount = EXCLUDED.amount, \
			processor_result = EXCLUDED.processor_result, \
			account = EXCLUDED.account, \
			type = EXCLUDED.type, \
			subtype = EXCLUDED.subtype, \
			product_schedule = EXCLUDED.product_schedule, \
			subaffiliate_1 = EXCLUDED.subaffiliate_1, \
			subaffiliate_2 = EXCLUDED.subaffiliate_2, \
			subaffiliate_3 = EXCLUDED.subaffiliate_3, \
			subaffiliate_4 = EXCLUDED.subaffiliate_4, \
			subaffiliate_5 = EXCLUDED.subaffiliate_5';

		const queryArgs = _.flatten(records.map(r => {

			return [
					r.id,
					r.datetime,
					r.customer,
					r.creditcard,
					r.merchant_provider,
					r.campaign,
					r.affiliate,
					r.amount,
					r.processor_result,
					r.account,
					r.type,
					r.subtype,
					r.product_schedule,
					r.subaffiliate_1,
					r.subaffiliate_2,
					r.subaffiliate_3,
					r.subaffiliate_4,
					r.subaffiliate_5
			];

		}));

		return this._auroraContext.connection.queryWithArgs(query, queryArgs)
			.then(() => records);

	}

}
