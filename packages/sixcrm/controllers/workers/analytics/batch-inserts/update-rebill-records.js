const du = require('@6crm/sixcrmcore/util/debug-utilities').default;
const WriteRecords = require('./write-records');

module.exports = class UpdateRebillRecords extends WriteRecords {

	constructor(auroraContext) {

		super(auroraContext);

	}

	getRecordKey(record) {

		return record.id;

	}

	async write(records) {
		if (records.length === 0) {
			return;

		}

		const record = records[0];

		let query = `
			UPDATE analytics.f_rebill
			SET status = $1
			WHERE id = $2`

		return this._auroraContext.withConnection((connection) => {

			du.debug('WriteRebillRecords: query', query, record);

			return connection.queryWithArgs(query, [record.status, record.id]);

		});

	}

}
