const du = global.SixCRM.routes.include('lib', 'debug-utilities.js');
const WriteEventRecords = require('../batch-inserts/write-event-records');
const WriteSessionRecords = require('../batch-inserts/write-session-records');

module.exports = class LeadEventHandler {

	constructor(auroraContext) {

		this._auroraContext = auroraContext;

	}

	execute(record) {

		du.debug('LeadEventHandler.execute()', record);

		return Promise.resolve()
			.then(() => new WriteSessionRecords(this._auroraContext).execute([record.session]))
			.then(() => new WriteEventRecords(this._auroraContext).execute([record]));

	}

}
