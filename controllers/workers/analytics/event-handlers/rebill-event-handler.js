const du = global.SixCRM.routes.include('lib', 'debug-utilities.js');
const WriteRebillRecords = require('../batch-inserts/write-rebill-records')

module.exports = class RebillEventHandler {

	constructor(auroraContext) {

		this._auroraContext = auroraContext;

	}

	execute(record) {

		du.debug('RebillEventHandler.execute()', record);

		return Promise.resolve()
			.then(() => new WriteRebillRecords(this._auroraContext).execute([record]));

	}

}
