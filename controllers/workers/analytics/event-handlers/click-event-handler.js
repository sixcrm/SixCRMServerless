const du = global.SixCRM.routes.include('lib', 'debug-utilities.js');
const WriteEventRecords = require('../batch-inserts/write-event-records');

module.exports = class ClickEventHandler {

	constructor(auroraContext) {

		this._auroraContext = auroraContext;

	}

	async execute(record) {

		du.debug('ClickEventHandler.execute()', record);

		await new WriteEventRecords(this._auroraContext).execute([record]);

	}

}
