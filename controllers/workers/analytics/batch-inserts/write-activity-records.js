const _ = require('lodash');
const du = require('@sixcrm/sixcrmcore/util/debug-utilities').default;

const ATTRIBUTES = 11;

module.exports = class WriteActivityRecords {

	constructor(auroraContext) {

		this._auroraContext = auroraContext;

	}

	execute(records) {

		du.debug('WriteActivityRecords.execute()');

		if (records.length === 0) {

			du.debug('WriteActivityRecords.execute(): no records');

			return;

		}

		let query =
			'INSERT INTO analytics.f_activity ( \
				id, \
				datetime, \
				"user", \
				account, \
				actor, \
				actor_type, \
				action, \
				acted_upon, \
				acted_upon_type, \
				associated_with, \
				associated_with_type) \
				VALUES ';

		const values = records.map((r, i) => {

			return (`(${Array.from(new Array(ATTRIBUTES), (val, index) => (i * ATTRIBUTES) + index + 1).map(n => `$${n}`).join(',')})`);

		});

		query += values.join(',');

		query += ' \
			ON CONFLICT (id) DO UPDATE SET  \
			"user" = EXCLUDED.user, \
			datetime = EXCLUDED.datetime, \
			account = EXCLUDED.account, \
			actor = EXCLUDED.actor, \
			actor_type = EXCLUDED.actor_type, \
			action = EXCLUDED.action, \
			acted_upon = EXCLUDED.acted_upon, \
			acted_upon_type = EXCLUDED.acted_upon_type, \
			associated_with = EXCLUDED.associated_with, \
			associated_with_type = EXCLUDED.associated_with_type';

		const queryArgs = _.flatten(records.map(r => {

			return [
				r.id,
				r.datetime,
				r.user,
				r.account,
				r.actor,
				r.actorType,
				r.action,
				r.actedUpon,
				r.actedUponType,
				r.associatedWith,
				r.associatedWithType
			];

		}));

		return this._auroraContext.withConnection((connection) => {

			du.debug('WriteActivityRecords: query', query, queryArgs);

			return connection.queryWithArgs(query, queryArgs);

		});

	}

}
