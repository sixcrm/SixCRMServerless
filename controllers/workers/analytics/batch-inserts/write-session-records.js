const _ = require('lodash');
const du = global.SixCRM.routes.include('lib', 'debug-utilities.js');

const ATTRIBUTES = 11;

module.exports = class WriteEventRecords {

	constructor(auroraContext) {

		this._auroraContext = auroraContext;

	}

	execute(records) {

		du.debug('WriteEventRecords.execute()');

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
				r.subaffiliate_1,
				r.subaffiliate_2,
				r.subaffiliate_3,
				r.subaffiliate_4,
				r.subaffiliate_5
			];

		}));

		return this._auroraContext.withConnection((connection) => {

			return connection.queryWithArgs(query, queryArgs);

		});

	}

}