const du = global.SixCRM.routes.include('lib', 'debug-utilities.js');
const WriteActivityRecords = require('../batch-inserts/write-activity-records');

module.exports = class ActivityEventHandler {

	constructor(auroraContext) {

		this._auroraContext = auroraContext;

	}

	execute(record) {

		du.debug('ActivityEventHandler.execute()', record);

		return Promise.resolve()
			.then(() => new WriteActivityRecords(this._auroraContext).execute([record]));

	}

}