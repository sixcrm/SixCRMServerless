const du = global.SixCRM.routes.include('lib', 'debug-utilities.js');
const WriteEventRecords = require('../batch-inserts/write-event-records');

module.exports = class OrderEventHandler {

	constructor(auroraContext) {

		this._auroraContext = auroraContext;

	}

	execute(record) {

		du.debug('OrderEventHandler.execute()', record);

		return Promise.resolve()
			.then(() => new WriteEventRecords(this._auroraContext).execute([record]));

	}

}
