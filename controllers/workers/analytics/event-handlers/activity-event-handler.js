const du = global.SixCRM.routes.include('lib', 'debug-utilities.js');
const WriteActivityRecords = require('../batch-inserts/write-activity-records');

module.exports = class ActivityEventHandler {

	constructor(auroraContext) {

		this._auroraContext = auroraContext;

	}

	async execute(record) {

		du.debug('ActivityEventHandler.execute()', record);

		await new WriteActivityRecords(this._auroraContext).execute([record]);

	}

}
