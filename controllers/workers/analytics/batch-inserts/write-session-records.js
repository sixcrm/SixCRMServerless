const _ = require('lodash');
const du = require('@sixcrm/sixcrmcore/util/debug-utilities').default;

const ATTRIBUTES = 11;

module.exports = class WriteEventRecords {

	constructor(auroraContext) {

		this._auroraContext = auroraContext;

	}

	execute(records) {

		du.debug('WriteSessionRecords.execute()');

		if (records.length === 0) {

			du.debug('WriteSessionRecords.execute(): no records');

			return;

		}

		let query =
			'INSERT INTO analytics.f_session ( \
				id, \
				datetime, \
				account, \
				campaign, \
				cid, \
				affiliate, \
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
			account = EXCLUDED.account, \
			campaign = EXCLUDED.campaign, \
			cid = EXCLUDED.cid, \
			affiliate = EXCLUDED.affiliate, \
			subaffiliate_1 = EXCLUDED.subaffiliate_1, \
			subaffiliate_2 = EXCLUDED.subaffiliate_2, \
			subaffiliate_3 = EXCLUDED.subaffiliate_3, \
			subaffiliate_4 = EXCLUDED.subaffiliate_4, \
			subaffiliate_5 = EXCLUDED.subaffiliate_5';

		const queryArgs = _.flatten(records.map(r => {

			return [
				r.id,
				r.datetime,
				r.account,
				r.campaign,
				r.cid,
				r.affiliate,
				r.subAffiliate1,
				r.subAffiliate2,
				r.subAffiliate3,
				r.subAffiliate4,
				r.subAffiliate5
			];

		}));

		return this._auroraContext.withConnection((connection) => {

			du.debug('WriteSessionRecords: query', query, queryArgs);

			return connection.queryWithArgs(query, queryArgs);

		});

	}

}
