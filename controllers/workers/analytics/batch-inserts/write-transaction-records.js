const _ = require('lodash');
const du = require('@6crm/sixcrmcore/util/debug-utilities').default;
const WriteRecords = require('./write-records');

const ATTRIBUTES = 28;

module.exports = class WriteTransactionRecords extends WriteRecords {

	constructor(auroraContext) {

		super(auroraContext);

	}

	getRecordKey(record) {

		return record.id;

	}

	write(records) {

		du.debug('WriteTransactionRecords.write()');

		if (records.length === 0) {

			du.debug('WriteTransactionRecords.write(): no records');

			return;

		}

		let query =
			'INSERT INTO analytics.f_transaction ( \
				id, \
				alias, \
				datetime, \
				associated_transaction, \
				session, \
				session_alias, \
				rebill, \
				rebill_alias, \
				customer, \
				customer_name, \
				creditcard, \
				merchant_provider, \
				merchant_provider_name, \
				merchant_provider_monthly_cap, \
				campaign, \
				campaign_name, \
				affiliate, \
				amount, \
				processor_result, \
				account, \
				type, \
				subtype, \
				transaction_type, \
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
			alias = EXCLUDED.alias, \
			datetime = EXCLUDED.datetime, \
			associated_transaction = EXCLUDED.associated_transaction, \
			session = EXCLUDED.session, \
			session_alias = EXCLUDED.session_alias, \
			rebill = EXCLUDED.rebill, \
			rebill_alias = EXCLUDED.rebill_alias, \
			customer = EXCLUDED.customer, \
			customer_name = EXCLUDED.customer_name, \
			creditcard = EXCLUDED.creditcard, \
			merchant_provider = EXCLUDED.merchant_provider, \
			merchant_provider_name = EXCLUDED.merchant_provider_name, \
			merchant_provider_monthly_cap = EXCLUDED.merchant_provider_monthly_cap, \
			campaign = EXCLUDED.campaign, \
			campaign_name = EXCLUDED.campaign_name, \
			affiliate = EXCLUDED.affiliate, \
			amount = EXCLUDED.amount, \
			processor_result = EXCLUDED.processor_result, \
			account = EXCLUDED.account, \
			type = EXCLUDED.type, \
			subtype = EXCLUDED.subtype, \
			transaction_type = EXCLUDED.transaction_type, \
			subaffiliate_1 = EXCLUDED.subaffiliate_1, \
			subaffiliate_2 = EXCLUDED.subaffiliate_2, \
			subaffiliate_3 = EXCLUDED.subaffiliate_3, \
			subaffiliate_4 = EXCLUDED.subaffiliate_4, \
			subaffiliate_5 = EXCLUDED.subaffiliate_5';

		const queryArgs = _.flatten(records.map(r => {

			return [
				r.id,
				r.alias,
				r.datetime,
				r.associatedTransaction,
				r.session.id,
				r.session.alias,
				r.rebill.id,
				r.rebill.alias,
				r.customer.id,
				r.customer.name,
				r.creditcard,
				r.merchantProvider.id,
				r.merchantProvider.name,
				r.merchantProvider.monthlyCap,
				r.campaign.id,
				r.campaign.name,
				r.affiliate,
				r.amount,
				r.processorResult,
				r.account,
				r.type,
				r.subtype || 'main',
				r.transactionType,
				r.subAffiliate1,
				r.subAffiliate2,
				r.subAffiliate3,
				r.subAffiliate4,
				r.subAffiliate5
			];

		}));

		return this._auroraContext.withConnection((connection) => {

			du.debug('WriteTransactionRecords: query', query, queryArgs);

			return connection.queryWithArgs(query, queryArgs);

		});

	}

}
