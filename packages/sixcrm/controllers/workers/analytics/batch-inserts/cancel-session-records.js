const du = require('@6crm/sixcrmcore/util/debug-utilities').default;
const WriteRecords = require('./write-records');

module.exports = class CancelSessionRecords extends WriteRecords {

	constructor(auroraContext) {

		super(auroraContext);

	}

	getRecordKey(record) {

		return record.id;

	}

	write(records) {
		if (records.length === 0) {
			return;

		}

		let query = `
			UPDATE analytics.f_subscription
			SET status = 'canceled'
			WHERE status = 'active' AND session IN `;

		const inClause = records.map((r, i) => `$${i + 1}`).join(',');
		query += `(${inClause});`;
		const queryArgs = records.map(r => r.id);

		return this._auroraContext.withConnection(async (connection) => {

			du.debug('CancelSessionRecords: query', query, queryArgs);

			await connection.queryWithArgs(query, queryArgs);

		});

	}

}
