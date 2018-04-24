const _ = require('lodash');
const du = global.SixCRM.routes.include('lib', 'debug-utilities.js');

const ATTRIBUTES = 20;

module.exports = class WriteTransactionRecords {

	constructor(auroraContext) {

		this._auroraContext = auroraContext;

	}

	execute(records) {

		du.debug('WriteTransactionRecords.execute()');

		let query =
			'INSERT INTO analytics.f_transaction ( \
				id, \
				datetime, \
				session, \
				customer, \
				creditcard, \
				merchant_provider, \
				merchant_provider_name, \
				merchant_provider_monthly_cap, \
				campaign, \
				affiliate, \
				amount, \
				processor_result, \
				account, \
				type, \
				subtype, \
				subaffiliate_1, \
				subaffiliate_2, \
				subaffiliate_3, \
				subaffiliate_4, \
				subaffiliate_5) \
				VALUES ';

		const values = records.map((r, i) => {

			return (`(${Array.from(new Array(ATTRIBUTES), (val, index) => (i * ATTRIBUTES) + index + 1).map(n => `$${n}`).join(',')})`);

		});

		query += values.join(',');

		query += ' \
			ON CONFLICT (id) DO UPDATE SET  \
			datetime = EXCLUDED.datetime, \
			session = EXCLUDED.session, \
			customer = EXCLUDED.customer, \
			creditcard = EXCLUDED.creditcard, \
			merchant_provider = EXCLUDED.merchant_provider, \
			merchant_provider_name = EXCLUDED.merchant_provider_name, \
			merchant_provider_monthly_cap = EXCLUDED.merchant_provider_monthly_cap, \
			campaign = EXCLUDED.campaign, \
			affiliate = EXCLUDED.affiliate, \
			amount = EXCLUDED.amount, \
			processor_result = EXCLUDED.processor_result, \
			account = EXCLUDED.account, \
			type = EXCLUDED.type, \
			subtype = EXCLUDED.subtype, \
			subaffiliate_1 = EXCLUDED.subaffiliate_1, \
			subaffiliate_2 = EXCLUDED.subaffiliate_2, \
			subaffiliate_3 = EXCLUDED.subaffiliate_3, \
			subaffiliate_4 = EXCLUDED.subaffiliate_4, \
			subaffiliate_5 = EXCLUDED.subaffiliate_5';

		const queryArgs = _.flatten(records.map(r => {

			return [
				r.id,
				r.datetime,
				r.session.id,
				r.customer,
				r.creditcard,
				r.merchantProvider.id,
				r.merchantProvider.name,
				r.merchantProvider.monthlyCap,
				r.campaign,
				r.affiliate,
				r.amount,
				r.processorResult,
				r.account,
				r.type,
				r.subtype || 'main',
				r.subAffiliate1,
				r.subAffiliate2,
				r.subAffiliate3,
				r.subAffiliate4,
				r.subAffiliate5
			];

		}));

		return this._auroraContext.withConnection((connection) => {

			return connection.queryWithArgs(query, queryArgs);

		});

	}

}
